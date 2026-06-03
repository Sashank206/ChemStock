import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { PremiumLayout } from "@/components/premium-layout";

export default async function AdminUsersPage() {
  const session = await getCurrentUser();
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div>Unauthorized</div>;
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <PremiumLayout role="ADMIN" userName={session.user.name || "Admin"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">User Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Browse all registered sellers, users, and administrators.</p>
        </div>
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
      </div>
    </PremiumLayout>
  );
}
