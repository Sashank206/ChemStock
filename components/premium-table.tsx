import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface PremiumTableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderCell?: (key: string, value: any, row: Record<string, any>) => ReactNode;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  className?: string;
}

export function PremiumTable({
  columns,
  data,
  renderCell,
  onSort,
  sortBy,
  sortOrder,
  className,
}: PremiumTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-6 py-4 text-left font-semibold text-slate-900 dark:text-white",
                  col.sortable && "cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <div className="flex flex-col">
                      {sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={`${idx}-${col.key}`}
                  className="px-6 py-4 text-slate-700 dark:text-slate-300"
                >
                  {renderCell?.(col.key, row[col.key], row) ?? row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
