import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";
import { Badge } from "@/components/ui/badge";

export default async function AdminInventoryPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }
  const products = await prisma.product.findMany({ include: { seller: true }, orderBy: { stockQuantity: "asc" } });

  return (
    <PremiumLayout role="ADMIN" userName={session.user.name || "Admin"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Inventory Oversight</h1>
          <p className="text-sm text-slate-500 mt-1">Track stock levels across products and flag low inventory items.</p>
        </div>
        <div className="grid gap-4">
        {products.map((product) => {
          const isLow = Number(product.stockQuantity) < 20;
          return (
            <div key={product.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Seller: {product.seller.name}</p>
                </div>
                <Badge variant={isLow ? "destructive" : "secondary"}>{isLow ? "Low stock" : "Healthy stock"}</Badge>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                <p className="text-sm text-muted-foreground">Stock: {Number(product.stockQuantity)} {product.baseUnit}</p>
                <p className="text-sm text-muted-foreground">Dimension: {product.dimension}</p>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </PremiumLayout>
  );
}
