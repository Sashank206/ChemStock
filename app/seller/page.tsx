import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { StatusBadge, type StatusType } from "@/components/premium-badge";
import { PremiumTable } from "@/components/premium-table";
import { AreaChart } from "@/components/premium-charts";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { formatMoney } from "@/lib/pricing";
import {
  Package,
  ShoppingCart,
  FileText,
  Plus,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export default async function SellerPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "SELLER") {
    return <div>Unauthorized</div>;
  }

  const sellerId = session.user.id;

  // 1. Fetch data
  const [productsCount, ordersCount, quotationsCount, sellerOrderItems, sellerQuotationItems, lowStockProducts, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.order.count({ where: { items: { some: { product: { sellerId } } } } }),
      prisma.quotation.count({ where: { items: { some: { product: { sellerId } } } } }),
      prisma.orderItem.findMany({
        where: { product: { sellerId } },
        include: { order: true },
      }),
      prisma.quotationItem.findMany({
        where: { product: { sellerId } },
        include: { quotation: true },
      }),
      prisma.product.findMany({
        where: { sellerId, stockQuantity: { lt: 50 } },
        select: { id: true, name: true, sku: true, stockQuantity: true, baseUnit: true },
        orderBy: { stockQuantity: "asc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { items: { some: { product: { sellerId } } } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // 2. Calculations
  const totalRevenue = sellerOrderItems.reduce(
    (sum, item) => sum + Number(item.orderedQuantity) * Number(item.itemPrice),
    0
  );

  // Group orders by month
  const monthlyRevenueMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString("default", { month: "short" });
    monthlyRevenueMap[monthName] = 0;
  }

  sellerOrderItems.forEach((item) => {
    const monthName = new Date(item.order.createdAt).toLocaleString("default", { month: "short" });
    if (monthName in monthlyRevenueMap) {
      monthlyRevenueMap[monthName] += Number(item.orderedQuantity) * Number(item.itemPrice);
    }
  });

  const chartData = Object.entries(monthlyRevenueMap).map(([label, value]) => ({
    label,
    value,
  }));

  // Quotation funnel pipeline counts
  const pipelineCounts = {
    DRAFT: 0,
    REQUESTED: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  const processedQuoteIds = new Set<string>();
  sellerQuotationItems.forEach((item) => {
    if (!processedQuoteIds.has(item.quotationId)) {
      processedQuoteIds.add(item.quotationId);
      const status = item.quotation.status;
      if (status in pipelineCounts) {
        pipelineCounts[status]++;
      }
    }
  });

  const tableColumns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
  ];

  const tableData = recentOrders.map((order) => ({
    id: order.id.slice(0, 8),
    customer: order.user.name,
    amount: formatMoney(Number(order.totalAmount)),
    status: order.status,
  }));

  return (
    <PremiumLayout role="SELLER" userName={session.user.name || "Seller"}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Seller Portal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {session.user.name}. Manage your inventory, view incoming order requests, and update quotes.
            </p>
          </div>
          <Link
            href="/seller/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="My Catalog Items"
            value={productsCount}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            className="hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300"
          />
          <StatCard
            label="Orders Received"
            value={ordersCount}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 15, isPositive: true }}
            className="hover:scale-[1.02] hover:border-violet-500/30 transition-all duration-300"
          />
          <StatCard
            label="Quotations Routed"
            value={quotationsCount}
            icon={<FileText className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            className="hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300"
          />
        </div>

        {/* Sales & Quotes pipeline */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <PremiumCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      Sales Revenue Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Earned sales value aggregated from your product order transactions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatMoney(totalRevenue)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">Total Revenue</p>
                  </div>
                </div>
                <div className="py-4">
                  <AreaChart data={chartData} valueType="money" height={220} color="emerald" />
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Quotations Pipeline */}
          <div>
            <PremiumCard className="h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <ClipboardList className="w-5 h-5 text-indigo-500" />
                  Quotation Funnel
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Lifecycle status of customer quote requests
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Requested</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      {pipelineCounts.REQUESTED}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      {pipelineCounts.APPROVED}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rejected</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold">
                      {pipelineCounts.REJECTED}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Draft / Other</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                      {pipelineCounts.DRAFT}
                    </span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Recent Orders & Action/Low Stock Panels */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Incoming Order Requests
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Latest order requests containing your listed catalog items
                  </p>
                </div>
                <Link
                  href="/seller/orders"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
                >
                  View All Orders
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <PremiumTable
                columns={tableColumns}
                data={tableData}
                renderCell={(key, value) => {
                  if (key === "status") {
                    return <StatusBadge status={value as StatusType} />;
                  }
                  return value;
                }}
              />
            </PremiumCard>
          </div>

          {/* Quick Actions & Low Stock Alerts */}
          <div className="space-y-6">
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
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
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
                  All catalog listings are sufficiently stocked.
                </p>
              )}
            </PremiumCard>

            {/* Quick Actions */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Portal Management
              </h3>
              <div className="space-y-2">
                <Link
                  href="/seller/products"
                  className="block w-full px-4 py-2.5 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all duration-200"
                >
                  Manage Catalog List
                </Link>
                <Link
                  href="/seller/orders"
                  className="block w-full px-4 py-2.5 text-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200"
                >
                  View Incoming Invoices
                </Link>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}
