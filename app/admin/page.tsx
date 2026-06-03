import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { StatusBadge } from "@/components/premium-badge";
import { PremiumTable } from "@/components/premium-table";
import { AreaChart, DonutChart } from "@/components/premium-charts";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/pricing";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }

  // 1. Core aggregates
  const [totalSellers, totalUsers, totalProducts, totalOrders, revenueData, recentOrders, lowStockProducts, categoryCounts] =
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
      prisma.product.findMany({
        where: { stockQuantity: { lt: 50 } },
        select: { id: true, name: true, sku: true, stockQuantity: true, baseUnit: true },
        orderBy: { stockQuantity: "asc" },
        take: 5,
      }),
      prisma.product.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
    ]);

  const totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  // 2. Format monthly revenue chart data (Last 6 Months)
  const monthlyRevenueMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString("default", { month: "short" });
    monthlyRevenueMap[monthName] = 0;
  }

  const allOrders = await prisma.order.findMany({
    select: { createdAt: true, totalAmount: true },
  });

  allOrders.forEach((order) => {
    const monthName = new Date(order.createdAt).toLocaleString("default", { month: "short" });
    if (monthName in monthlyRevenueMap) {
      monthlyRevenueMap[monthName] += Number(order.totalAmount);
    }
  });

  const chartData = Object.entries(monthlyRevenueMap).map(([label, value]) => ({
    label,
    value,
  }));

  // 3. Format category donut data
  const palette = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
  const donutData = categoryCounts.map((cat, idx) => ({
    label: cat.category,
    value: cat._count.id,
    color: palette[idx % palette.length],
  }));

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

  // Calculations for role distribution
  const totalPeople = totalSellers + totalUsers;
  const sellerPercentage = totalPeople > 0 ? (totalSellers / totalPeople) * 100 : 0;
  const buyerPercentage = totalPeople > 0 ? (totalUsers / totalPeople) * 100 : 0;

  return (
    <PremiumLayout role="ADMIN" userName={session.user.name || "Admin"}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {session.user.name}. Here's the snapshot of your store analytics.
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sellers"
            value={totalSellers}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            className="hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300"
          />
          <StatCard
            label="Total Buyers"
            value={totalUsers}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            className="hover:scale-[1.02] hover:border-violet-500/30 transition-all duration-300"
          />
          <StatCard
            label="Active Products"
            value={totalProducts}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 5, isPositive: true }}
            className="hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300"
          />
          <StatCard
            label="Total Revenue"
            value={formatMoney(totalRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 23, isPositive: true }}
            className="hover:scale-[1.02] hover:border-amber-500/30 transition-all duration-300 border-2 border-indigo-500/10 dark:border-indigo-500/5 shadow-indigo-100/20 dark:shadow-none"
          />
        </div>

        {/* Charts & Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2">
            <PremiumCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      Revenue Trends
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Monthly revenue comparison over the last 6 months
                    </p>
                  </div>
                </div>
                <div className="py-4">
                  <AreaChart data={chartData} valueType="money" height={220} color="indigo" />
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Donut Chart Category Breakdown */}
          <div>
            <PremiumCard className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Product Categories
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Distribution of stock items in the catalog
                </p>
                <div className="flex justify-center items-center py-4">
                  <DonutChart data={donutData} className="w-full" />
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <PremiumCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Latest {recentOrders.length} orders processed in the system
                  </p>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
                >
                  View All Orders
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

          {/* Quick Stats, Low Stock, Actions */}
          <div className="space-y-6">
            {/* User growth progress */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                User Base Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Sellers ({totalSellers})
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Buyers ({totalUsers})
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${sellerPercentage}%` }}
                  />
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${buyerPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{sellerPercentage.toFixed(0)}% Sellers</span>
                  <span>{buyerPercentage.toFixed(0)}% Buyers</span>
                </div>
              </div>
            </PremiumCard>

            {/* Low Stock Alerts */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock Alerts
              </h3>
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          SKU: {p.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {Number(p.stockQuantity).toFixed(0)} {p.baseUnit}
                        </span>
                        <p className="text-[9px] text-slate-400">Remaining</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
                  All items are sufficiently stocked.
                </p>
              )}
            </PremiumCard>

            {/* Quick Actions */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Administration Tasks
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/users"
                  className="block w-full px-4 py-2.5 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all duration-200"
                >
                  Manage User Database
                </Link>
                <Link
                  href="/admin/products"
                  className="block w-full px-4 py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200"
                >
                  Manage Product Inventory
                </Link>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}
