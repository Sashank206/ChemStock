import { Prisma } from "@prisma/client";
import { formatMoney } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";
import { PremiumCard } from "@/components/premium-cards";
import { EmptyState } from "@/components/premium-empty-state";
import {
  Search,
  ShoppingCart,
  Package,
} from "lucide-react";

async function requestQuotation(formData: FormData) {
  "use server";
  const userSession = await getCurrentUser();
  const productId = formData.get("productId")?.toString();
  const orderedQuantity = Number(formData.get("orderedQuantity"));
  const orderedUnit = formData.get("orderedUnit")?.toString() as "g" | "kg" | "mL" | "L" | "item";
  if (!productId || !orderedQuantity || !orderedUnit || !userSession?.user?.id) return;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const baseUnit = product.baseUnit;
  const conversionMap = { g: 1, kg: 1000, mL: 1, L: 1000, item: 1 };
  const convertedQuantity = orderedQuantity * conversionMap[orderedUnit as keyof typeof conversionMap] / conversionMap[baseUnit as keyof typeof conversionMap];
  const itemPrice = Number(product.basePrice);
  const totalAmount = Number((convertedQuantity * itemPrice).toFixed(2));

  await prisma.quotation.create({
    data: {
      userId: userSession.user.id,
      status: "REQUESTED",
      totalAmount,
      items: {
        create: {
          productId: product.id,
          orderedQuantity: orderedQuantity,
          orderedUnit,
          convertedQuantity,
          itemPrice,
        },
      },
    },
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "USER") {
    return <div>Unauthorized</div>;
  }

  const categories = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
  });

  const where: Prisma.ProductWhereInput = {};
  if (searchParams.q) {
    where.name = { contains: searchParams.q, mode: "insensitive" };
  }
  if (searchParams.category) {
    where.category = searchParams.category;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { seller: true },
  });

  return (
    <PremiumLayout role="USER" userName={session.user.name || "User"}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Browse our full product lineup and request quotations
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <form action="" method="get" className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams.q ?? ""}
                  placeholder="Search products by name or SKU..."
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <select
                name="category"
                defaultValue={searchParams.category ?? ""}
                className="h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Filter
              </button>
            </form>
          </div>

          {/* Active Filters */}
          {(searchParams.q || searchParams.category) && (
            <div className="flex flex-wrap gap-2">
              {searchParams.q && (
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                  Search: {searchParams.q}
                </span>
              )}
              {searchParams.category && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  Category: {searchParams.category}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No Products Found"
            description="Try adjusting your search filters or browse all products"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group">
                <PremiumCard hover>
                  {/* Product Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {product.category}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Price
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {formatMoney(Number(product.basePrice))}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        per {product.baseUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Stock
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {Number(product.stockQuantity).toFixed(0)}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        available
                      </p>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="mb-6 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      by {product.seller.name}
                    </p>
                  </div>

                  {/* Quotation Form */}
                  <form action={requestQuotation} className="space-y-3">
                    <input type="hidden" name="productId" value={product.id} />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        name="orderedQuantity"
                        min="1"
                        step="0.01"
                        placeholder="Qty"
                        required
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                      />
                      <select
                        name="orderedUnit"
                        defaultValue={product.baseUnit}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none"
                      >
                        {["g", "kg", "mL", "L", "item"].map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Request Quote
                    </button>
                  </form>
                </PremiumCard>
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumLayout>
  );
}

