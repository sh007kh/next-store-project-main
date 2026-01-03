const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    id: "1",
    name: "Accent Chair",
    company: "Marcos",
    description: "Cloud bread VHS hell of banjo bicycle rights jianbing umami mumblecore etsy 8-bit pok pok +1 wolf. Vexillologist yr dreamcatcher waistcoat, authentic chillwave trust fund. Viral typewriter fingerstache pinterest pork belly narwhal. Schlitz venmo everyday carry kitsch pitchfork chillwave iPhone taiyaki trust fund hashtag kinfolk microdosing gochujang live-edge",
    featured: true,
    image: "/images/product-1.jpg",
    price: 25999,
    clerkId: "user_32Kb2uxvIiKDu39vGvnyre7MsQC"
  },
  {
    id: "2", 
    name: "Albano Bed",
    company: "Luxora",
    description: "Cloud bread VHS hell of banjo bicycle rights jianbing umami mumblecore etsy 8-bit pok pok +1 wolf. Vexillologist yr dreamcatcher waistcoat, authentic chillwave trust fund. Viral typewriter fingerstache pinterest pork belly narwhal. Schlitz venmo everyday carry kitsch pitchfork chillwave iPhone taiyaki trust fund hashtag kinfolk microdosing gochujang live-edge",
    featured: true,
    image: "/images/product-2.jpg", 
    price: 79999,
    clerkId: "user_32Kb2uxvIiKDu39vGvnyre7MsQC"
  },
  {
    id: "3",
    name: "Armchair",
    company: "Marcos", 
    description: "Cloud bread VHS hell of banjo bicycle rights jianbing umami mumblecore etsy 8-bit pok pok +1 wolf. Vexillologist yr dreamcatcher waistcoat, authentic chillwave trust fund. Viral typewriter fingerstache pinterest pork belly narwhal. Schlitz venmo everyday carry kitsch pitchfork chillwave iPhone taiyaki trust fund hashtag kinfolk microdosing gochujang live-edge",
    featured: true,
    image: "/images/product-3.jpg",
    price: 12999,
    clerkId: "user_32Kb2uxvIiKDu39vGvnyre7MsQC"
  }
];

async function main() {
  console.log('Seeding database...');
  
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${product.name}`);
  }
  
  console.log('Seeding completed!');
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