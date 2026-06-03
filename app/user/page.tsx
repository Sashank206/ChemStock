import { PremiumLayout } from "@/components/premium-layout";
import { StatCard, PremiumCard } from "@/components/premium-cards";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/pricing";
import { BarChart } from "@/components/premium-charts";
import {
  Package,
  FileText,
  ShoppingCart,
  Clock,
  ArrowRight,
  FlaskConical,
  Wrench,
  Layers,
  CheckCircle2,
  Truck,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";

export default async function UserPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "USER") {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id;

  // 1. Fetch data
  const [productCount, quoteCount, orderCount, recentOrders, recommendedProducts] = await Promise.all([
    prisma.product.count(),
    prisma.quotation.count({ where: { userId } }),
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 3, // Let's take 3 recent orders for a more focused tracker view
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { seller: true },
      take: 3,
    }),
  ]);

  // 2. Spending Trend calculations (Last 6 Months)
  const allBuyerOrders = await prisma.order.findMany({
    where: { userId },
    select: { createdAt: true, totalAmount: true },
  });

  const monthlySpendingMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString("default", { month: "short" });
    monthlySpendingMap[monthName] = 0;
  }

  allBuyerOrders.forEach((order) => {
    const monthName = new Date(order.createdAt).toLocaleString("default", { month: "short" });
    if (monthName in monthlySpendingMap) {
      monthlySpendingMap[monthName] += Number(order.totalAmount);
    }
  });

  const spendingChartData = Object.entries(monthlySpendingMap).map(([label, value]) => ({
    label,
    value,
  }));

  // Timeline helper mapping
  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING":
        return 1;
      case "APPROVED":
        return 2;
      case "SHIPPED":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 0; // Cancelled or Draft
    }
  };

  const steps = [
    { label: "Ordered", icon: Clock },
    { label: "Approved", icon: CheckCircle2 },
    { label: "Shipped", icon: Truck },
    { label: "Arrived", icon: Package },
  ];

  return (
    <PremiumLayout role="USER" userName={session.user.name || "User"}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Buyer Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {session.user.name}. Track your purchases, request custom pricing, and search the chemicals index.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            label="Available Catalog Items"
            value={productCount}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 5, isPositive: true }}
            className="hover:scale-[1.02] hover:border-indigo-500/30 transition-all duration-300"
          />
          <StatCard
            label="My Quotes"
            value={quoteCount}
            icon={<FileText className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            className="hover:scale-[1.02] hover:border-emerald-500/30 transition-all duration-300"
          />
          <StatCard
            label="Orders Logged"
            value={orderCount}
            icon={<ShoppingCart className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            className="hover:scale-[1.02] hover:border-violet-500/30 transition-all duration-300"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions & Spending Trends */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Quick Browse Grid */}
            <PremiumCard>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Explore Catalog Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/products?category=Chemicals"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Chemicals</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Reagents & Solvents</p>
                  </div>
                </Link>

                <Link
                  href="/products?category=Equipment"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Equipment</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Lab Hardware & Tools</p>
                  </div>
                </Link>

                <Link
                  href="/products?category=Supplies"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 text-amber-700 dark:text-amber-400 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Supplies</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Glassware & Kits</p>
                  </div>
                </Link>
              </div>
            </PremiumCard>

            {/* Spending Trends Bar Chart */}
            <PremiumCard>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Purchasing History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Monthly spending volume aggregated from completed orders
              </p>
              <div className="py-2">
                <BarChart data={spendingChartData} valueType="money" height={200} color="indigo" />
              </div>
            </PremiumCard>

            {/* Recent Orders with Custom Shipping Status Timeline */}
            <PremiumCard>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Order Shipments Tracker
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Visual delivery pipeline updates on your active invoices
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
                >
                  All Invoices
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-6">
                  {recentOrders.map((order) => {
                    const activeStep = getStatusStep(order.status);
                    const isCancelled = order.status === "CANCELLED";

                    return (
                      <div
                        key={order.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-3 gap-2">
                          <div>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                              Invoice ID
                            </span>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              Order #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-[10px] text-slate-400 font-medium">Order Total</span>
                            <p className="font-black text-slate-950 dark:text-white text-base">
                              {formatMoney(Number(order.totalAmount))}
                            </p>
                          </div>
                        </div>

                        {/* Order Timeline Visuals */}
                        {isCancelled ? (
                          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs text-red-600 dark:text-red-400 font-bold">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            This order has been cancelled.
                          </div>
                        ) : (
                          <div className="mt-6">
                            {/* Horizontal Line and Steps */}
                            <div className="relative flex items-center justify-between">
                              {/* Background Line */}
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                              {/* Active Segment Line */}
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                                style={{
                                  width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`,
                                }}
                              />

                              {steps.map((step, idx) => {
                                const stepNum = idx + 1;
                                const StepIcon = step.icon;
                                const isDone = stepNum <= activeStep;
                                const isCurrent = stepNum === activeStep;

                                return (
                                  <div
                                    key={idx}
                                    className="relative flex flex-col items-center z-10"
                                  >
                                    <div
                                      className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-sm",
                                        isDone
                                          ? "bg-indigo-500 dark:bg-indigo-400 border-indigo-500 dark:border-indigo-400 text-white"
                                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                                      )}
                                    >
                                      <StepIcon className="w-4 h-4" />
                                    </div>
                                    <span
                                      className={cn(
                                        "absolute top-9 text-[10px] font-bold whitespace-nowrap",
                                        isCurrent
                                          ? "text-indigo-600 dark:text-indigo-400"
                                          : isDone
                                          ? "text-slate-800 dark:text-slate-200"
                                          : "text-slate-400"
                                      )}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Spacing for labels */}
                            <div className="h-6" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No recent orders logged</p>
                  <p className="text-xs text-slate-400 mt-1">Browse the product catalog to create a checkout invoice.</p>
                </div>
              )}
            </PremiumCard>
          </div>

          {/* Recommended products & Resources */}
          <div className="space-y-6">
            {/* Recommended Products */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Recently Added Products
              </h3>
              <div className="space-y-4">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/20 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {p.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-500">
                          {p.baseUnit}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1.5 line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">by {p.seller.name}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-200/40 dark:border-slate-800/30">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {formatMoney(Number(p.basePrice))}
                      </span>
                      <Link
                        href="/products"
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
                      >
                        Request Quote
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>

            {/* Help Resource */}
            <PremiumCard>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-500" />
                Getting Started
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="font-bold text-blue-900 dark:text-blue-200">
                    Browse the catalog
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Select categories, search and add quantites to request instantly.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">
                    Review incoming quotes
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Go to Quotations to approve final pricing offered by the sellers.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="font-bold text-purple-900 dark:text-purple-200">
                    Secure checkout invoice
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Complete payments and track logistics from dispatch to door.
                  </p>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}
