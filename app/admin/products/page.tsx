import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productSchema } from "@/lib/validations";
import { formatMoney } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const nav: NavItem[] = [
  { title: "Products", href: "/admin/products" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Users", href: "/admin/users" },
  { title: "Inventory", href: "/admin/inventory" },
];

async function createProduct(formData: FormData) {
  "use server";
  const values = productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    image: formData.get("image"),
    category: formData.get("category"),
    dimension: formData.get("dimension"),
    baseUnit: formData.get("baseUnit"),
    stockQuantity: formData.get("stockQuantity"),
    basePrice: formData.get("basePrice"),
    sellerId: formData.get("sellerId"),
  });

  await prisma.product.create({
    data: {
      name: values.name,
      sku: values.sku,
      description: values.description ?? null,
      image: values.image ?? null,
      category: values.category,
      dimension: values.dimension,
      baseUnit: values.baseUnit,
      stockQuantity: Number(values.stockQuantity),
      basePrice: Number(values.basePrice),
      sellerId: values.sellerId ?? "",
    },
  });
}

async function deleteProduct(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.product.delete({ where: { id } });
}

async function updateProduct(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  const values = productSchema.parse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    image: formData.get("image"),
    category: formData.get("category"),
    dimension: formData.get("dimension"),
    baseUnit: formData.get("baseUnit"),
    stockQuantity: formData.get("stockQuantity"),
    basePrice: formData.get("basePrice"),
    sellerId: formData.get("sellerId"),
  });

  await prisma.product.update({
    where: { id },
    data: {
      name: values.name,
      sku: values.sku,
      description: values.description ?? null,
      image: values.image ?? null,
      category: values.category,
      dimension: values.dimension,
      baseUnit: values.baseUnit,
      stockQuantity: Number(values.stockQuantity),
      basePrice: Number(values.basePrice),
      sellerId: values.sellerId ?? undefined,
    },
  });
}

export default async function AdminProductsPage() {
  const session = await getCurrentUser();
  const [products, sellers] = await Promise.all([
    prisma.product.findMany({ include: { seller: true } }),
    prisma.user.findMany({ where: { role: "SELLER" } }),
  ]);

  return (
    <DashboardShell
      title="Product Management"
      description={`Create, update, and audit all products in the system.`}
      nav={nav}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
          <h2 className="text-lg font-semibold text-foreground">Create Product</h2>
          <form action={createProduct} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Name</span>
                <Input name="name" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>SKU</span>
                <Input name="sku" />
              </label>
            </div>
            <label className="grid gap-2 text-sm">
              <span>Description</span>
              <Input name="description" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Category</span>
                <Input name="category" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Dimension</span>
                <Input name="dimension" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Base Unit</span>
                <Select name="baseUnit" defaultValue="item">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { label: "g", value: "g" },
                      { label: "kg", value: "kg" },
                      { label: "mL", value: "mL" },
                      { label: "L", value: "L" },
                      { label: "item", value: "item" },
                    ].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-2 text-sm">
                <span>Seller</span>
                <Select name="sellerId" defaultValue={sellers[0]?.id ?? ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Stock Quantity</span>
                <Input name="stockQuantity" type="number" step="0.01" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Base Price</span>
                <Input name="basePrice" type="number" step="0.01" />
              </label>
            </div>
            <Button type="submit" className="w-fit">Create Product</Button>
          </form>
        </section>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
          <h2 className="text-lg font-semibold text-foreground">All Products</h2>
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-3xl border border-border/70 bg-background p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">SKU {product.sku} • {product.category}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatMoney(Number(product.basePrice))}</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm text-muted-foreground">Seller: {product.seller.name}</p>
                  <p className="text-sm text-muted-foreground">Stock: {Number(product.stockQuantity)} {product.baseUnit}</p>
                </div>
                <form action={deleteProduct} className="mt-4 flex flex-wrap items-center gap-3">
                  <input type="hidden" name="id" value={product.id} />
                  <Button type="submit" variant="destructive" size="sm">Delete</Button>
                </form>
                <details className="mt-4 rounded-3xl border border-border/70 bg-muted p-4">
                  <summary className="cursor-pointer text-sm font-medium text-foreground">Edit product</summary>
                  <form action={updateProduct} className="mt-4 grid gap-4">
                    <input type="hidden" name="id" value={product.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input name="name" defaultValue={product.name} placeholder="Name" />
                      <Input name="sku" defaultValue={product.sku} placeholder="SKU" />
                    </div>
                    <Input name="description" defaultValue={product.description ?? ""} placeholder="Description" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input name="category" defaultValue={product.category} placeholder="Category" />
                      <Input name="dimension" defaultValue={product.dimension} placeholder="Dimension" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input name="stockQuantity" type="number" step="0.01" defaultValue={product.stockQuantity.toString()} placeholder="Stock" />
                      <Input name="basePrice" type="number" step="0.01" defaultValue={product.basePrice.toString()} placeholder="Price" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Select name="baseUnit" defaultValue={product.baseUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { label: "g", value: "g" },
                            { label: "kg", value: "kg" },
                            { label: "mL", value: "mL" },
                            { label: "L", value: "L" },
                            { label: "item", value: "item" },
                          ].map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select name="sellerId" defaultValue={product.sellerId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.id} value={seller.id}>
                              {seller.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" size="sm">Save Changes</Button>
                  </form>
                </details>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
