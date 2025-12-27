import "dotenv/config";
// const { PrismaClient } = require("@prisma/client");
import { PrismaClient } from "../generated/prisma/client";
const products = require("./products.json");
const prisma = new PrismaClient();

async function main() {
  for (const productData of products) {
    const { variants, ...productFields } = productData;
    const product = await prisma.product.create({
      data: productFields,
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
