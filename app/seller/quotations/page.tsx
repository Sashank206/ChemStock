import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { formatMoney } from "@/lib/pricing";

const nav: NavItem[] = [
  { title: "Products", href: "/seller/products" },
  { title: "Orders", href: "/seller/orders" },
  { title: "Quotations", href: "/seller/quotations" },
];

export default async function SellerQuotationsPage() {
  const session = await getCurrentUser();
  const quotations = await prisma.quotation.findMany({
    where: { items: { some: { product: { sellerId: session?.user?.id } } } },
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell title="Seller Quotations" description="Review quotation requests that include your products." nav={nav}>
      <div className="space-y-4">
        {quotations.map((quotation) => (
          <div key={quotation.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Quote {quotation.id.slice(0, 8)}</p>
                <p className="text-lg font-semibold text-foreground">{formatMoney(Number(quotation.totalAmount))}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{quotation.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">User: {quotation.user.name}</p>
            <div className="mt-4 grid gap-3">
              {quotation.items.map((item) => (
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
