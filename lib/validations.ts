import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name is required" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["SELLER", "USER"]),
});

export const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  category: z.string().min(2),
  dimension: z.string().min(1),
  baseUnit: z.enum(["g", "kg", "mL", "L", "item"]),
  stockQuantity: z.string().min(1),
  basePrice: z.string().min(1),
  sellerId: z.string().optional(),
});

export const quotationRequestSchema = z.object({
  productId: z.string().uuid(),
  orderedQuantity: z.string().min(1),
  orderedUnit: z.enum(["g", "kg", "mL", "L", "item"]),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["PENDING", "APPROVED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
