import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { formatMoney } from "@/lib/pricing";

const nav: NavItem[] = [
  { title: "Products", href: "/seller/products" },
  { title: "Orders", href: "/seller/orders" },
  { title: "Quotations", href: "/seller/quotations" },
];

export default async function SellerOrdersPage() {
  const session = await getCurrentUser();
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: session?.user?.id } } } },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="Seller Orders" description="View orders that include your products." nav={nav}>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <p className="text-sm text-muted-foreground">Order {order.id.slice(0, 8)}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatMoney(Number(order.totalAmount))}</p>
            <p className="text-sm text-muted-foreground">User: {order.user.name} · Status: {order.status}</p>
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
