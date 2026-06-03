import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";
import { Button } from "@/components/ui/button";
import { orderStatusSchema } from "@/lib/validations";
import { formatMoney } from "@/lib/pricing";

async function updateOrderStatus(formData: FormData) {
  "use server";
  const values = orderStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  await prisma.order.update({
    where: { id: values.orderId },
    data: { status: values.status },
  });
}

export default async function AdminOrdersPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PremiumLayout role="ADMIN" userName={session.user.name || "Admin"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review all orders and update status centrally.</p>
        </div>
        <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Order {order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">User: {order.user.name} · {formatMoney(Number(order.totalAmount))}</p>
              </div>
              <form action={updateOrderStatus} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                {(["PENDING", "APPROVED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((status) => (
                  <Button key={status} type="submit" name="status" value={status} variant={order.status === status ? "secondary" : "outline"} size="sm">
                    {status}
                  </Button>
                ))}
              </form>
            </div>
            <div className="mt-4 grid gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {Number(item.orderedQuantity)} {item.orderedUnit} · Item price: {formatMoney(Number(item.itemPrice))}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </PremiumLayout>
  );
}
