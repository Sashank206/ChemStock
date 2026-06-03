import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";

const nav: NavItem[] = [
  { title: "Products", href: "/admin/products" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Users", href: "/admin/users" },
  { title: "Inventory", href: "/admin/inventory" },
];

export default async function AdminInventoryPage() {
  const session = await getCurrentUser();
  const products = await prisma.product.findMany({ include: { seller: true }, orderBy: { stockQuantity: "asc" } });

  return (
    <DashboardShell
      title="Inventory Oversight"
      description="Track stock levels across products and flag low inventory items."
      nav={nav}
    >
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
    </DashboardShell>
  );
}
