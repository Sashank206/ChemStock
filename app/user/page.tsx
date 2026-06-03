import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Package, FileText, ShoppingCart, Clock } from "lucide-react";
import Link from "next/link";

export default async function UserPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "USER") {
    return <div>Unauthorized</div>;
  }

  const [productCount, quoteCount, orderCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.quotation.count({ where: { userId: session.user.id } }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <PremiumLayout role="USER" userName={session.user.name || "User"}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Buyer Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back, {session.user.name}. Browse products and manage your orders.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="Available Products"
            value={productCount}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            label="My Quotations"
            value={quoteCount}
            icon={<FileText className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            label="My Orders"
            value={orderCount}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <PremiumCard>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/products"
                  className="flex items-center justify-between p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors group"
                >
                  <span className="text-sm font-medium">Browse Products</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/quotation"
                  className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors group"
                >
                  <span className="text-sm font-medium">My Quotations</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors group"
                >
                  <span className="text-sm font-medium">My Orders</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors group"
                >
                  <span className="text-sm font-medium">New Request</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </PremiumCard>

            {/* Recent Orders */}
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Your latest orders
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          Order {order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          ${Number(order.totalAmount).toFixed(2)}
                        </p>
                        <span
                          className="text-xs font-semibold mt-1 inline-block px-2 py-1 rounded-full"
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-slate-400">No orders yet</p>
                </div>
              )}
            </PremiumCard>
          </div>

          {/* Tips & Resources */}
          <PremiumCard>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Getting Started
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Browse our catalog
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                  Start by exploring the products catalog
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <p className="font-medium text-purple-900 dark:text-purple-100">
                  Request a quotation
                </p>
                <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
                  Get instant pricing for any product
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Place orders
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1">
                  Complete your purchase and track delivery
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumLayout>
  );
}

