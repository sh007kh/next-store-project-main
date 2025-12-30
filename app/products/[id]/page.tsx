import BreadCrumbs from "@/components/single-product/BreadCrumbs";
import { formatCurrency } from "@/utils/format";
import FavoriteToggleButton from "@/components/products/FavoriteToggleButton";
import AddToCart from "@/components/single-product/AddToCart";
import ProductRating from "@/components/single-product/ProductRating";
import ShareButton from "@/components/single-product/ShareButton";
import SubmitReview from "@/components/reviews/SubmitReview";
import ProductReviews from "@/components/reviews/ProductReviews";
import ImageCarousel from "@/components/single-product/ImageCarousel";
import { fetchSingleProduct, findExistingReview } from "@/utils/actions";
import { auth } from "@clerk/nextjs/server";
import { ProductVariantModel } from "@/generated/prisma/models/ProductVariant";

async function SingleProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchSingleProduct(id);
  const {
    name,
    images,
    company,
    description,
    price,
    variants,
    category,
    subcategory,
  } = product;
  const filteredVariants = variants.filter(
    (variant: ProductVariantModel) => variant.stock > 0
  );
  const dollarsAmount = formatCurrency(price);
  const { userId } = await auth();
  const reviewDoesNotExist =
    userId && !(await findExistingReview(userId, product.id));

  const categoryName = category?.name || subcategory?.name || "Uncategorized";

  return (
    <section>
      {/* Hidden category tag for SEO */}
      <meta name="category" content={categoryName} />
      <BreadCrumbs name={product.name} />
      <div className="mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16">
        {/* IMAGE FIRST COL */}
        <ImageCarousel images={images} name={name} />
        {/* PRODUCT INFO SECOND COL */}
        <div>
          <div className="flex gap-x-8 items-center">
            <h1 className="capitalize text-3xl font-bold">{name}</h1>
            <div className="flex gap-x-8 items-center">
              <div className="flex items-center gap-x-2">
                <FavoriteToggleButton productId={id} />
                <ShareButton name={product.name} productId={id} />
              </div>
            </div>
          </div>
          <ProductRating productId={id} />
          <h4 className="text-xl mt-2">{company}</h4>
          <p className="mt-3 text-md bg-muted inline-block p-2 rounded-md">
            {dollarsAmount}
          </p>
          <p className="mt-6 leading-8 text-muted-foreground">{description}</p>
          <AddToCart productId={id} variants={filteredVariants} />
        </div>
      </div>
      <ProductReviews productId={id} />
      {reviewDoesNotExist && <SubmitReview productId={id} />}
    </section>
  );
}
export default SingleProductPage;
