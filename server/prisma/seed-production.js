const prisma = require("../src/prisma");
const seed = require("./seed");

async function main() {
  const [userCount, customerCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.order.count()
  ]);

  if (userCount || customerCount || orderCount) {
    console.log("Production seed skipped. Existing shared data was found.");
    return;
  }

  await seed();
  await seed.disconnect();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
