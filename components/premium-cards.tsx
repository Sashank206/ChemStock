import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({
  children,
  className,
  hover = true,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6",
        hover &&
          "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <PremiumCard className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          {icon}
        </div>
      </div>
    </PremiumCard>
  );
}
