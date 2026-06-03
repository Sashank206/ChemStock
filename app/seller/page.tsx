import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/pricing";
import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function SellerPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "SELLER") {
    return <div>Unauthorized</div>;
  }

  const sellerId = session.user.id;

  const [products, orders, quotations, revenueData, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.order.count({ where: { items: { some: { product: { sellerId } } } } }),
      prisma.quotation.count({
        where: { items: { some: { product: { sellerId } } } },
      }),
      prisma.order.findMany({
        where: { items: { some: { product: { sellerId } } } },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        where: { items: { some: { product: { sellerId } } } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return (
    <PremiumLayout role="SELLER" userName={session.user.name || "Seller"}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Seller Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Welcome back, {session.user.name}. Manage your catalog and orders.
            </p>
          </div>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="My Products"
            value={products}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            label="Orders"
            value={orders}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            label="Quotations"
            value={quotations}
            icon={<FileText className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
        </div>

        {/* Revenue & Orders */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Card */}
          <PremiumCard className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatMoney(totalRevenue)}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  From {orders} orders
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </PremiumCard>

          {/* Quick Actions */}
          <PremiumCard>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/seller/products"
                className="block w-full px-4 py-2 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                Manage Products
              </Link>
              <Link
                href="/seller/orders"
                className="block w-full px-4 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                View Orders
              </Link>
            </div>
          </PremiumCard>
        </div>

        {/* Recent Orders */}
        <PremiumCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Orders
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Latest orders from your products
              </p>
            </div>
            <Link
              href="/seller/orders"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {order.user.name}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {formatMoney(Number(order.totalAmount))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor:
                            order.status === "DELIVERED"
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(59, 130, 246, 0.1)",
                          color:
                            order.status === "DELIVERED"
                              ? "rgb(34, 197, 94)"
                              : "rgb(59, 130, 246)",
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}

