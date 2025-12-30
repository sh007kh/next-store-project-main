"use server";

import db from "@/utils/db";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  imageSchema,
  productSchema,
  reviewSchema,
  categorySchema,
  subcategorySchema,
  validateWithZodSchema,
} from "./schemas";
import { deleteImage, uploadImage } from "./supabase";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";
import { Cart, Size, Color } from "../app/generated/prisma/client";
import { Prisma } from "../app/generated/prisma/client";

export const fetchFeaturedProducts = async () => {
  const products = await db.product.findMany({
    where: {
      featured: true,
    },
    include: {
      images: true,
    },
  });
  return products;
};

export const fetchDistinctCompanies = async () => {
  const companies = await db.product.findMany({
    select: {
      company: true,
    },
    distinct: ["company"],
  });
  return companies.map((c) => c.company);
};

export const fetchDistinctSizes = async () => {
  const sizes = await db.productVariant.findMany({
    select: {
      size: true,
    },
    distinct: ["size"],
  });
  return sizes.map((s) => s.size);
};

export const fetchDistinctColors = async () => {
  const colors = await db.productVariant.findMany({
    select: {
      color: true,
    },
    distinct: ["color"],
  });
  return colors.map((c) => c.color);
};

export const fetchAllProducts = async ({
  search = "",
  company = "",
  size = "",
  color = "",
  priceMin = "",
  priceMax = "",
  category = "",
  subcategory = "",
  sort = "createdAt-desc",
}: {
  search?: string;
  company?: string;
  size?: string;
  color?: string;
  priceMin?: string;
  priceMax?: string;
  category?: string;
  subcategory?: string;
  sort?: string;
}) => {
  const where: { AND: Prisma.ProductWhereInput[] } = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (company) {
    where.AND.push({ company: { equals: company, mode: "insensitive" } });
  }

  if (priceMin) {
    where.AND.push({ price: { gte: parseInt(priceMin) } });
  }

  if (priceMax) {
    where.AND.push({ price: { lte: parseInt(priceMax) } });
  }

  if (category) {
    where.AND.push({ categoryId: category });
  }

  if (subcategory) {
    where.AND.push({ subcategoryId: subcategory });
  }

  if (size || color) {
    const variantWhere: Prisma.ProductVariantWhereInput = {};
    if (size) {
      variantWhere.size = size as Size;
    }
    if (color) {
      variantWhere.color = color as Color;
    }
    where.AND.push({
      variants: {
        some: variantWhere,
      },
    });
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { price: "desc" };
  }

  return db.product.findMany({
    where,
    include: {
      variants: true,
      images: true,
    },
    orderBy,
  });
};

export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      variants: true,
      images: true,
      category: true,
      subcategory: true,
    },
  });
  if (!product) {
    redirect("/products");
  }
  return product;
};

const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to access this route");
  }
  return user;
};

const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
  return user;
};

export const fetchAdminProducts = async () => {
  await getAdminUser();
  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return products;
};
const renderError = (error: unknown): { message: string } => {
  console.log(error);
  return {
    message: error instanceof Error ? error.message : "An error occurred",
  };
};
export const createProductAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const files = formData.getAll("image") as File[];

    const validatedFields = validateWithZodSchema(productSchema, rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error!.issues.map(
        (error) => error.message
      );
      throw new Error(errors.join(", "));
    }

    // Validate all images
    const validatedFiles = await Promise.all(
      files.map((file) => validateWithZodSchema(imageSchema, { image: file }))
    );

    for (const validatedFile of validatedFiles) {
      if (!validatedFile.success) {
        const errors = validatedFile.error!.issues.map(
          (error) => error.message
        );
        throw new Error(errors.join(", "));
      }
    }

    const uploadedImages = await Promise.all(
      validatedFiles.map((vf) => uploadImage(vf.data!.image))
    );

    const { size, categoryId, subcategoryId, ...productData } =
      validatedFields.data!;

    const product = await db.product.create({
      data: {
        ...productData,
        clerkId: user.id,
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
      },
    });

    // Create image records
    await db.productImage.createMany({
      data: uploadedImages.map((url) => ({
        productId: product.id,
        imageUrl: url,
      })),
    });

    // Create variant
    const color = formData.get("color") as string;
    const stock = Number(formData.get("stock"));

    await db.productVariant.create({
      data: {
        productId: product.id,
        color: color as Color,
        size: size as Size,
        stock,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  revalidatePath("/admin/products");
  return { message: "Product created successfully" };
};

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  await getAdminUser();
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (product?.images) {
      await Promise.all(product.images.map((img) => deleteImage(img.imageUrl)));
    }

    await db.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/admin/products");
    return { message: "product removed" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser();
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      variants: true,
      images: true,
    },
  });
  if (!product) redirect("/admin/products");
  return product;
};

export const updateProductImageAction = async (
  prevState: unknown,
  formData: FormData
) => {
  await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const productId = formData.get("id") as string;

    const validatedFile = validateWithZodSchema(imageSchema, { image });

    if (!validatedFile.success) {
      const errors = validatedFile.error!.issues.map((error) => error.message);
      throw new Error(errors.join(", "));
    }

    const fullPath = await uploadImage(validatedFile.data!.image);
    await db.productImage.create({
      data: {
        productId,
        imageUrl: fullPath,
      },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "Product Image added successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProductAction = async (
  prevState: unknown,
  formData: FormData
) => {
  await getAdminUser();
  try {
    const productId = formData.get("id") as string;
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(productSchema, rawData);

    if (!validatedFields.success) {
      const errors = validatedFields.error!.issues.map(
        (error) => error.message
      );
      throw new Error(errors.join(", "));
    }

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        ...validatedFields.data,
      },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    return { message: "Product updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const user = await getAuthUser();
  const favorite = await db.favorite.findFirst({
    where: {
      productId,
      clerkId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favorite?.id || null;
};

export const toggleFavoriteAction = async (prevState: {
  productId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { productId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          productId,
          clerkId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return { message: favoriteId ? "Removed from Faves" : "Added to Faves" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchUserFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      clerkId: user.id,
    },
    include: {
      product: true,
    },
  });
  return favorites;
};

export const createReviewAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);

    const validatedFields = validateWithZodSchema(reviewSchema, rawData);

    if (!validatedFields.success || !validatedFields.data) {
      const errors = validatedFields.error!.issues.map(
        (error) => error.message
      );
      throw new Error(errors.join(", "));
    }

    const { productId, authorName, authorImageUrl, rating, comment } =
      validatedFields.data;

    await db.review.create({
      data: {
        productId,
        authorName,
        authorImageUrl,
        rating,
        comment,
        clerkId: user.id,
      },
    });
    revalidatePath(`/products/${productId}`);
    return { message: "Review submitted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchProductReviews = async (productId: string) => {
  const reviews = await db.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
};
export const fetchProductReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      clerkId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      product: {
        select: {
          name: true,
          images: {
            select: {
              imageUrl: true,
            },
            take: 1,
          },
        },
      },
    },
  });
  return reviews;
};
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        clerkId: user.id,
      },
    });

    revalidatePath("/reviews");
    return { message: "Review deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};
export const fetchProductRating = async (productId: string) => {
  const result = await db.review.groupBy({
    by: ["productId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      productId,
    },
  });

  // empty array if no reviews
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
};

export const findExistingReview = async (userId: string, productId: string) => {
  return db.review.findFirst({
    where: {
      clerkId: userId,
      productId,
    },
  });
};

export const fetchCartItems = async () => {
  const { userId } = await auth();

  const cart = await db.cart.findFirst({
    where: {
      clerkId: userId ?? "",
    },
    select: {
      numItemsInCart: true,
    },
  });
  return cart?.numItemsInCart || 0;
};

const fetchProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};
const includeProductClause = {
  cartItems: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  },
};

export const fetchOrCreateCart = async ({
  userId,
  errorOnFailure = false,
}: {
  userId: string;
  errorOnFailure?: boolean;
}) => {
  let cart = await db.cart.findFirst({
    where: {
      clerkId: userId,
    },
    include: includeProductClause,
  });

  if (!cart && errorOnFailure) {
    throw new Error("Cart not found");
  }

  if (!cart) {
    cart = await db.cart.create({
      data: {
        clerkId: userId,
      },
      include: includeProductClause,
    });
  }

  return cart;
};

const updateOrCreateCartItem = async ({
  variantId,
  cartId,
  amount,
}: {
  variantId: string;
  cartId: string;
  amount: number;
}) => {
  let cartItem = await db.cartItem.findFirst({
    where: {
      variantId,
      cartId,
    },
  });

  if (cartItem) {
    cartItem = await db.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        amount: cartItem.amount + amount,
      },
    });
  } else {
    cartItem = await db.cartItem.create({
      data: { amount, variantId, cartId },
    });
  }
};

export const updateCart = async (cart: Cart) => {
  const cartItems = await db.cartItem.findMany({
    where: {
      cartId: cart.id,
    },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let numItemsInCart = 0;
  let cartTotal = 0;

  for (const item of cartItems) {
    numItemsInCart += item.amount;
    cartTotal += item.amount * item.variant.product.price;
  }
  const tax = cart.taxRate * cartTotal;
  const shipping = cartTotal ? cart.shipping : 0;
  const orderTotal = cartTotal + tax + shipping;

  const currentCart = await db.cart.update({
    where: {
      id: cart.id,
    },

    data: {
      numItemsInCart,
      cartTotal,
      tax,
      orderTotal,
    },
    include: includeProductClause,
  });
  return { currentCart, cartItems };
};

export const addToCartAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const productId = formData.get("productId") as string;
    const amount = Number(formData.get("amount"));
    const color = formData.get("color") as string;
    const size = formData.get("size") as string;
    await fetchProduct(productId);
    const variant = await db.productVariant.findFirst({
      where: {
        productId,
        color: color as Color,
        size: size as Size,
      },
    });
    if (!variant) {
      throw new Error("Variant not found");
    }
    const cart = await fetchOrCreateCart({ userId: user.id });
    await updateOrCreateCartItem({
      variantId: variant.id,
      cartId: cart.id,
      amount,
    });
    await updateCart(cart);
  } catch (error) {
    return renderError(error);
  }
  redirect("/cart");
};

export const removeCartItemAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const user = await getAuthUser();
  try {
    const cartItemId = formData.get("id") as string;
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });
    await db.cartItem.delete({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    await updateCart(cart);
    revalidatePath("/cart");
    return { message: "Item removed from cart" };
  } catch (error) {
    return renderError(error);
  }
};
export const updateCartItemAction = async ({
  amount,
  cartItemId,
}: {
  amount: number;
  cartItemId: string;
}) => {
  const user = await getAuthUser();

  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });
    await db.cartItem.update({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      data: {
        amount,
      },
    });
    await updateCart(cart);
    revalidatePath("/cart");
    return { message: "cart updated" };
  } catch (error) {
    return renderError(error);
  }
};

export const createOrderAction = async (
  prevState: unknown,
  formData: FormData
) => {
  const user = await getAuthUser();
  let orderId: null | string = null;
  let cartId: null | string = null;
  try {
    const cart = await fetchOrCreateCart({
      userId: user.id,
      errorOnFailure: true,
    });
    cartId = cart.id;
    await db.order.deleteMany({
      where: {
        clerkId: user.id,
        isPaid: false,
      },
    });

    const order = await db.order.create({
      data: {
        clerkId: user.id,
        products: cart.numItemsInCart,
        orderTotal: cart.orderTotal,
        tax: cart.tax,
        shipping: cart.shipping,
        email: user.emailAddresses[0].emailAddress,
      },
    });
    orderId = order.id;
  } catch (error) {
    return renderError(error);
  }
  redirect(`/checkout?orderId=${orderId}&cartId=${cartId}`);
};
export const fetchUserOrders = async () => {
  const user = await getAuthUser();
  const orders = await db.order.findMany({
    where: {
      clerkId: user.id,
      isPaid: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
};

export const fetchAdminOrders = async () => {
  const user = await getAdminUser();

  const orders = await db.order.findMany({
    where: {
      isPaid: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return orders;
};

export const updateVariantAction = async (
  prevState: unknown,
  formData: FormData
) => {
  await getAdminUser();
  const variantId = formData.get("id") as string;
  const color = formData.get("color") as string;
  const size = formData.get("size") as string;
  const stock = Number(formData.get("stock"));
  try {
    await db.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        color: color as Color,
        size: size as Size,
        stock,
      },
    });
    revalidatePath("/admin/products");
    return { message: "Variant updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const deleteVariantAction = async (
  prevState: { message: string },
  formData: FormData
) => {
  await getAdminUser();
  const variantId = formData.get("variantId") as string;
  try {
    await db.productVariant.delete({
      where: {
        id: variantId,
      },
    });
    revalidatePath("/admin/products");
    return { message: "Variant deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const addVariantAction = async (
  prevState: unknown,
  formData: FormData
) => {
  await getAdminUser();
  const productId = formData.get("productId") as string;
  const color = formData.get("color") as string;
  const size = formData.get("size") as string;
  const stock = Number(formData.get("stock"));
  try {
    await db.productVariant.create({
      data: {
        productId,
        color: color as Color,
        size: size as Size,
        stock,
      },
    });
    revalidatePath("/admin/products");
    return { message: "Variant added successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAdminCategories = async () => {
  await getAdminUser();
  const categories = await db.category.findMany({
    include: {
      subcategories: {
        include: {
          products: true,
        },
      },
      products: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return categories;
};

export const fetchCategories = async () => {
  const categories = await db.category.findMany({
    include: {
      subcategories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return categories;
};

export const createCategoryAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(categorySchema, rawData);
    if (!validatedFields.success) {
      const errors = validatedFields.error!.issues.map(
        (error) => error.message
      );
      throw new Error(errors.join(", "));
    }
    await db.category.create({
      data: validatedFields.data!,
    });
    revalidatePath("/admin/categories");
    return { message: "Category created successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const deleteCategoryAction = async (prevState: {
  categoryId: string;
}) => {
  const { categoryId } = prevState;
  await getAdminUser();
  try {
    await db.category.delete({
      where: {
        id: categoryId,
      },
    });
    revalidatePath("/admin/categories");
    return { message: "Category removed" };
  } catch (error) {
    return renderError(error);
  }
};

export const createSubcategoryAction = async (
  prevState: unknown,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(subcategorySchema, rawData);
    if (!validatedFields.success) {
      const errors = validatedFields.error!.issues.map(
        (error) => error.message
      );
      throw new Error(errors.join(", "));
    }
    await db.subcategory.create({
      data: validatedFields.data!,
    });
    revalidatePath("/admin/categories");
    return { message: "Subcategory created successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const deleteSubcategoryAction = async (prevState: {
  subcategoryId: string;
}) => {
  const { subcategoryId } = prevState;
  await getAdminUser();
  try {
    await db.subcategory.delete({
      where: {
        id: subcategoryId,
      },
    });
    revalidatePath("/admin/categories");
    return { message: "Subcategory removed" };
  } catch (error) {
    return renderError(error);
  }
};
