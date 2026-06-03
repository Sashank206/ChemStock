import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { formatMoney } from "@/lib/pricing";

const nav: NavItem[] = [
  { title: "Products", href: "/products" },
  { title: "Quotation", href: "/quotation" },
  { title: "Orders", href: "/orders" },
];

export default async function OrdersPage() {
  const session = await getCurrentUser();
  const orders = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="My Orders" description="Track your past and current orders." nav={nav}>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order {order.id.slice(0, 8)}</p>
                <p className="text-2xl font-semibold text-foreground">{formatMoney(Number(order.totalAmount))}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{order.status}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {Number(item.orderedQuantity)} {item.orderedUnit}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
