import { PrismaClient, Role, Unit, QuotationStatus, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@chemstock.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@chemstock.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@chemstock.com" },
    update: {},
    create: {
      name: "Seller User",
      email: "seller@chemstock.com",
      password: hashedPassword,
      role: Role.SELLER,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@chemstock.com" },
    update: {},
    create: {
      name: "User Account",
      email: "user@chemstock.com",
      password: hashedPassword,
      role: Role.USER,
    },
  });

  const products = [
    {
      name: "Analytical Balance",
      sku: "CHEM-001",
      description: "Precision balance for laboratory measurements.",
      image: "/products/balance.jpg",
      category: "Equipment",
      dimension: "20x20x15 cm",
      baseUnit: Unit.item,
      stockQuantity: 15,
      basePrice: 85000,
    },
    {
      name: "Hydrochloric Acid",
      sku: "CHEM-002",
      description: "37% HCl reagent grade for laboratory use.",
      image: "/products/hcl.jpg",
      category: "Chemicals",
      dimension: "1 L",
      baseUnit: Unit.L,
      stockQuantity: 80,
      basePrice: 150,
    },
    {
      name: "Ethanol",
      sku: "CHEM-003",
      description: "Absolute ethanol for synthesis and cleaning.",
      image: "/products/ethanol.jpg",
      category: "Chemicals",
      dimension: "1 L",
      baseUnit: Unit.L,
      stockQuantity: 120,
      basePrice: 220,
    },
    {
      name: "Sodium Chloride",
      sku: "CHEM-004",
      description: "Laboratory grade NaCl powder.",
      image: "/products/nacl.jpg",
      category: "Chemicals",
      dimension: "500 g",
      baseUnit: Unit.g,
      stockQuantity: 5000,
      basePrice: 0.05,
    },
    {
      name: "Glass Beaker Set",
      sku: "CHEM-005",
      description: "Set of 5 borosilicate lab beakers.",
      image: "/products/beakers.jpg",
      category: "Equipment",
      dimension: "various",
      baseUnit: Unit.item,
      stockQuantity: 35,
      basePrice: 2500,
    },
    {
      name: "Distilled Water",
      sku: "CHEM-006",
      description: "High-purity distilled water for experiments.",
      image: "/products/water.jpg",
      category: "Supplies",
      dimension: "5 L",
      baseUnit: Unit.L,
      stockQuantity: 50,
      basePrice: 45,
    },
    {
      name: "Acetone",
      sku: "CHEM-007",
      description: "Solvent grade acetone for cleaning and prep.",
      image: "/products/acetone.jpg",
      category: "Chemicals",
      dimension: "1 L",
      baseUnit: Unit.L,
      stockQuantity: 90,
      basePrice: 180,
    },
    {
      name: "pH Indicator Strips",
      sku: "CHEM-008",
      description: "Colorimetric strips for acid/base analysis.",
      image: "/products/ph-strips.jpg",
      category: "Supplies",
      dimension: "100 item",
      baseUnit: Unit.item,
      stockQuantity: 200,
      basePrice: 350,
    },
    {
      name: "Volumetric Flask 250mL",
      sku: "CHEM-009",
      description: "Precision volumetric flask for solution prep.",
      image: "/products/flask.jpg",
      category: "Equipment",
      dimension: "250 mL",
      baseUnit: Unit.mL,
      stockQuantity: 25000,
      basePrice: 18,
    },
    {
      name: "Sodium Hydroxide",
      sku: "CHEM-010",
      description: "Solid NaOH pellets for buffer preparation.",
      image: "/products/naoh.jpg",
      category: "Chemicals",
      dimension: "500 g",
      baseUnit: Unit.g,
      stockQuantity: 4000,
      basePrice: 0.12,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        ...product,
        sellerId: seller.id,
      },
      create: {
        ...product,
        sellerId: seller.id,
      },
    });
  }

  const hclProduct = await prisma.product.findUnique({ where: { sku: "CHEM-002" } });
  const ethanolProduct = await prisma.product.findUnique({ where: { sku: "CHEM-003" } });

  if (hclProduct) {
    await prisma.quotation.upsert({
      where: { id: "sample-quote-1" },
      update: {},
      create: {
        id: "sample-quote-1",
        userId: user.id,
        status: QuotationStatus.REQUESTED,
        totalAmount: 300,
        items: {
          create: [
            {
              productId: hclProduct.id,
              orderedQuantity: 2,
              orderedUnit: Unit.L,
              convertedQuantity: 2000,
              itemPrice: 150,
            },
          ],
        },
      },
    });
  }

  if (ethanolProduct) {
    await prisma.order.upsert({
      where: { id: "sample-order-1" },
      update: {},
      create: {
        id: "sample-order-1",
        userId: user.id,
        status: OrderStatus.DELIVERED,
        totalAmount: 1100,
        items: {
          create: [
            {
              productId: ethanolProduct.id,
              orderedQuantity: 5,
              orderedUnit: Unit.L,
              convertedQuantity: 5000,
              itemPrice: 220,
            },
          ],
        },
      },
    });
  }

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
