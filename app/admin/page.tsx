import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { StatusBadge, RoleBadge } from "@/components/premium-badge";
import { PremiumTable } from "@/components/premium-table";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/pricing";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }

  const [totalSellers, totalUsers, totalProducts, totalOrders, revenueData, recentOrders] =
    await Promise.all([
      prisma.user.count({ where: { role: "SELLER" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
      prisma.order.findMany({
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const tableColumns = [
    { key: "id", label: "Order ID", sortable: true },
    { key: "userEmail", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "totalAmount", label: "Amount" },
    { key: "createdAt", label: "Date" },
  ];

  const tableData = recentOrders.map((order) => ({
    id: order.id.slice(0, 8),
    userEmail: order.user.email,
    status: order.status,
    totalAmount: formatMoney(Number(order.totalAmount)),
    createdAt: new Date(order.createdAt).toLocaleDateString(),
  }));

  return (
    <PremiumLayout role="ADMIN" userName={session.user.name || "Admin"}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back, {session.user.name}. Here's your business overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sellers"
            value={totalSellers}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            label="Total Buyers"
            value={totalUsers}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            label="Products"
            value={totalProducts}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            label="Total Revenue"
            value={formatMoney(totalRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Latest {recentOrders.length} orders in the system
                  </p>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              <PremiumTable
                columns={tableColumns}
                data={tableData}
                renderCell={(key, value, row) => {
                  if (key === "status") {
                    return <StatusBadge status={value as any} />;
                  }
                  return value;
                }}
              />
            </PremiumCard>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <PremiumCard>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Total Orders
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {totalOrders}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Avg Order Value
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatMoney(totalRevenue / (totalOrders || 1))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Product Listings
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {totalProducts}
                  </span>
                </div>
              </div>
            </PremiumCard>

            {/* Actions */}
            <PremiumCard>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users"
                  className="block w-full px-4 py-2 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/products"
                  className="block w-full px-4 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}

