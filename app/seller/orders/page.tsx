import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";
import { formatMoney } from "@/lib/pricing";

export default async function SellerOrdersPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "SELLER") {
    return <div>Unauthorized</div>;
  }
  const orders = await prisma.order.findMany({
    where: { items: { some: { product: { sellerId: session.user.id } } } },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PremiumLayout role="SELLER" userName={session.user.name || "Seller"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Seller Orders</h1>
          <p className="text-sm text-slate-500 mt-1">View orders that include your products.</p>
        </div>
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
        </div>
      </div>
    </PremiumLayout>
  );
}
