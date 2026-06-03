import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/pricing";

async function placeOrder(formData: FormData) {
  "use server";
  const quoteId = formData.get("quoteId")?.toString();
  const session = await getCurrentUser();
  if (!quoteId || !session?.user?.id) return;

  const quotation = await prisma.quotation.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });
  if (!quotation || quotation.userId !== session.user.id) return;

  await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "PENDING",
      totalAmount: quotation.totalAmount,
      items: {
        create: quotation.items.map((item) => ({
          productId: item.productId,
          orderedQuantity: item.orderedQuantity,
          orderedUnit: item.orderedUnit,
          convertedQuantity: item.convertedQuantity,
          itemPrice: item.itemPrice,
        })),
      },
    },
  });

  await prisma.quotation.update({
    where: { id: quoteId },
    data: { status: "APPROVED" },
  });
}

export default async function QuotationPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "USER") {
    return <div>Unauthorized</div>;
  }
  const quotations = await prisma.quotation.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PremiumLayout role="USER" userName={session.user.name || "User"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Your Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">Review quote requests and convert them into orders.</p>
        </div>
        <div className="space-y-4">
        {quotations.map((quotation) => (
          <div key={quotation.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quote {quotation.id.slice(0, 8)}</p>
                <p className="text-2xl font-semibold text-foreground">{formatMoney(Number(quotation.totalAmount))}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{quotation.status}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {quotation.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {Number(item.orderedQuantity)} {item.orderedUnit}</p>
                </div>
              ))}
            </div>
            {quotation.status === "REQUESTED" ? (
              <form action={placeOrder} className="mt-4">
                <input type="hidden" name="quoteId" value={quotation.id} />
                <Button type="submit">Place Order</Button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </PremiumLayout>
  );
}
