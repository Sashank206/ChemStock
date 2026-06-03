"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavItem = {
  title: string;
  href: string;
};

export function DashboardShell({
  title,
  description,
  nav,
  children,
}: {
  title: string;
  description?: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl bg-background p-4 shadow-sm ring-1 ring-border sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              {description ? <p className="max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </Button>
              <Button variant="secondary" size="sm" onClick={() => router.refresh()}>
                Refresh
              </Button>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <aside className="rounded-3xl border border-border bg-card p-4 ring-1 ring-border/50">
              <div className="mb-4 space-y-1 text-sm font-medium text-foreground">
                {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-2xl px-3 py-2 transition",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </aside>
            <main className="space-y-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
