import { cn } from "@/lib/utils";

export type StatusType = "PENDING" | "APPROVED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "DRAFT" | "REQUESTED" | "REJECTED";

const statusColors: Record<StatusType, { bg: string; text: string; dot: string }> = {
  PENDING: {
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  APPROVED: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  SHIPPED: {
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  DELIVERED: {
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  DRAFT: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  REQUESTED: {
    bg: "bg-indigo-50 dark:bg-indigo-950",
    text: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  REJECTED: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const colors = statusColors[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
        colors.bg,
        colors.text,
        className
      )}
    >
      {showDot && <span className={cn("w-2 h-2 rounded-full", colors.dot)} />}
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: "ADMIN" | "SELLER" | "USER" }) {
  const colors = {
    ADMIN: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
    SELLER: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
    USER: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        colors[role]
      )}
    >
      {role}
    </span>
  );
}

export function StockStatusBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <StatusBadge status="CANCELLED" />;
  } else if (quantity < 10) {
    return <StatusBadge status="PENDING" />;
  } else {
    return <StatusBadge status="APPROVED" />;
  }
}
