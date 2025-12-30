import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import fs from "fs";
const products = JSON.parse(fs.readFileSync("./prisma/products.json", "utf8"));

async function main() {
  // Create categories
  const menCategory = await prisma.category.upsert({
    where: { name: "men" },
    update: {},
    create: { name: "men" },
  });
  const womenCategory = await prisma.category.upsert({
    where: { name: "women" },
    update: {},
    create: { name: "women" },
  });
  const childCategory = await prisma.category.upsert({
    where: { name: "child" },
    update: {},
    create: { name: "child" },
  });

  // Create subcategories for men
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "shirt", categoryId: menCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "shirt", categoryId: menCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "pants", categoryId: menCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "pants", categoryId: menCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "underwear", categoryId: menCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "underwear", categoryId: menCategory.id },
    });
  }

  // Create subcategories for women
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "shirt", categoryId: womenCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "shirt", categoryId: womenCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "pants", categoryId: womenCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "pants", categoryId: womenCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "underwear", categoryId: womenCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "underwear", categoryId: womenCategory.id },
    });
  }

  // Create subcategories for child
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "shirt", categoryId: childCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "shirt", categoryId: childCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "pants", categoryId: childCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "pants", categoryId: childCategory.id },
    });
  }
  if (
    !(await prisma.subcategory.findFirst({
      where: { name: "underwear", categoryId: childCategory.id },
    }))
  ) {
    await prisma.subcategory.create({
      data: { name: "underwear", categoryId: childCategory.id },
    });
  }

  for (const productData of products) {
    const { variants, image, ...productFields } = productData;
    const product = await prisma.product.create({
      data: productFields,
    });
    // Create product image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: image,
      },
    });
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: product.id,
        },
      });
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
