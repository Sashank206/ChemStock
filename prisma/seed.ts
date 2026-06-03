import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@chemstock.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@chemstock.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Seller
  await prisma.user.upsert({
    where: { email: "seller@chemstock.com" },
    update: {},
    create: {
      name: "Seller",
      email: "seller@chemstock.com",
      password: hashedPassword,
      role: Role.SELLER,
    },
  });

  // Buyer
  await prisma.user.upsert({
    where: { email: "buyer@chemstock.com" },
    update: {},
    create: {
      name: "Buyer",
      email: "buyer@chemstock.com",
      password: hashedPassword,
      role: Role.BUYER,
    },
  });

  console.log("Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });