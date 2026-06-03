import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const nav: NavItem[] = [
  { title: "Products", href: "/admin/products" },
  { title: "Orders", href: "/admin/orders" },
  { title: "Users", href: "/admin/users" },
  { title: "Inventory", href: "/admin/inventory" },
];

export default async function AdminUsersPage() {
  const session = await getCurrentUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <DashboardShell
      title="User Directory"
      description="Browse all registered sellers, users, and administrators."
      nav={nav}
    >
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{user.role}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Joined {user.createdAt.toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
