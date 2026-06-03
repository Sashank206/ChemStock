# ChemStock Pro

A full-stack Inventory, Quotation, and Order Management System built using Next.js, Prisma ORM, Neon PostgreSQL, and NextAuth.

This project was developed as part of the AasaMedChem Hackathon Assignment to demonstrate inventory management, role-based authentication, quotation generation, order processing, and unit conversion handling with high-precision calculations.

---

## Features

### Authentication & Authorization

* Secure Login and Registration
* Role-Based Access Control (RBAC)
* Three Roles:

  * Admin
  * Seller
  * User

### Product Management

* Create Products
* Update Products
* Delete Products
* Product Categories
* SKU Management
* Product Images
* Inventory Tracking

### Search & Filtering

* Search by Product Name
* Search by SKU
* Filter by Category
* Filter by Product Dimension

### Quotation Management

* Generate Quotations
* Dynamic Price Calculation
* Unit Conversion Support
* Multiple Product Selection

### Order Management

* Place Orders
* Track Orders
* Order Status Updates
* Order History

### Inventory Management

* Real-Time Inventory Tracking
* Stock Quantity Updates
* Seller Inventory Control

### Dashboard Analytics

#### Admin Dashboard

* Total Users
* Total Sellers
* Total Products
* Total Orders
* Revenue Tracking

#### Seller Dashboard

* Product Statistics
* Inventory Overview
* Orders Overview
* Quotations Overview

#### User Dashboard

* My Quotations
* My Orders
* Recent Activities

---

# Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* Shadcn UI

## Backend

* Next.js Server Actions
* API Routes

## Authentication

* NextAuth
* bcryptjs

## Database

* Neon PostgreSQL

## ORM

* Prisma ORM

## Deployment

* Vercel

---

# System Architecture

```text
User Browser
      │
      ▼
Next.js Frontend
      │
      ▼
API Routes / Server Actions
      │
      ▼
Prisma ORM
      │
      ▼
Neon PostgreSQL
```

---

# User Roles

## Admin

Capabilities:

* Manage Products
* Manage Inventory
* View All Orders
* View All Quotations
* Manage Users
* Dashboard Analytics

---

## Seller

Capabilities:

* Add Products
* Edit Products
* Delete Products
* Manage Inventory
* View Orders
* View Quotations

---

## User

Capabilities:

* Browse Products
* Search Products
* Generate Quotations
* Place Orders
* View Order History

---

# Database Design

## User

| Field     | Type     |
| --------- | -------- |
| id        | UUID     |
| name      | String   |
| email     | String   |
| password  | String   |
| role      | Enum     |
| createdAt | DateTime |

---

## Product

| Field         | Type    |
| ------------- | ------- |
| id            | UUID    |
| name          | String  |
| sku           | String  |
| description   | String  |
| image         | String  |
| category      | String  |
| dimension     | String  |
| baseUnit      | String  |
| stockQuantity | Decimal |
| basePrice     | Decimal |
| sellerId      | UUID    |

---

## Quotation

| Field       | Type    |
| ----------- | ------- |
| id          | UUID    |
| userId      | UUID    |
| totalAmount | Decimal |
| status      | String  |

---

## Order

| Field       | Type    |
| ----------- | ------- |
| id          | UUID    |
| userId      | UUID    |
| totalAmount | Decimal |
| status      | String  |

---

# Unit Storage Strategy

To ensure consistency and accurate calculations, all quantities are stored internally using base units.

## Weight

Internal Storage Unit:

```text
grams (g)
```

Supported Units:

```text
g
kg
```

Conversion:

```text
1 kg = 1000 g
```

---

## Volume

Internal Storage Unit:

```text
milliliters (mL)
```

Supported Units:

```text
mL
L
```

Conversion:

```text
1 L = 1000 mL
```

---

## Count

Internal Storage Unit:

```text
item
```

Supported Units:

```text
item
```

Conversion:

```text
1 item = 1 item
```

---

# Pricing Strategy

Prices are stored per base unit.

Example:

```text
Product:
Acetone

Base Unit:
mL

Base Price:
₹0.75 per mL
```

User Order:

```text
2 L
```

Conversion:

```text
2 L = 2000 mL
```

Price Calculation:

```text
2000 × ₹0.75
```

Final Price:

```text
₹1500
```

---

# Precision Handling

The application uses PostgreSQL:

```sql
NUMERIC(20,6)
```

For:

* Prices
* Quantities
* Conversion Values

Benefits:

* High Precision
* Large Value Support
* No Floating Point Errors

---

# Project Structure

```text
app/
├── admin/
├── seller/
├── user/
├── login/
├── register/
├── products/
├── quotation/
├── orders/

components/
├── dashboard/
├── products/
├── layout/
├── ui/

lib/
├── prisma.ts
├── auth.ts
├── conversions.ts
├── pricing.ts

prisma/
├── schema.prisma
├── seed.ts

public/
```

---

# Installation

Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/chemstock-pro.git
```

Move into project

```bash
cd chemstock-pro
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create:

```text
.env
```

Add:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

# Database Setup

Generate Prisma Client

```bash
npx prisma generate
```

Run Migrations

```bash
npx prisma migrate dev
```

Seed Database

```bash
npx prisma db seed
```

---

# Running Locally

```bash
npm run dev
```

Application:

```text
http://localhost:3000
```

---

# Test Credentials

## Admin

```text
Email:
admin@chemstock.com

Password:
123456
```

## Seller

```text
Email:
seller@chemstock.com

Password:
123456
```

## User

```text
Email:
user@chemstock.com

Password:
123456
```

---

# Deployment

Deploy using Vercel.

Steps:

1. Push code to GitHub
2. Import repository into Vercel
3. Configure environment variables
4. Deploy

---

# Future Enhancements

* Email Notifications
* Inventory Alerts
* Sales Reports
* CSV Export
* Product Reviews
* Multi-Image Upload
* Advanced Analytics

---

# License

This project is developed for educational and assessment purposes as part of the AasaMedChem Hackathon Assignment.
