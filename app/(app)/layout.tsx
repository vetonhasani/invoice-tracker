"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Package, Settings, Users } from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, Menu, cn } from "@/components/ui";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/clients", label: "Klientët", icon: Users },
  { href: "/materials", label: "Materialet", icon: Package },
  { href: "/settings", label: "Profili", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user)
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );

  const doLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-dvh pb-24 sm:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/clients">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.slice(0, 2).map((n) => {
                const on = path.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                      on ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-slate-100 hover:text-ink"
                    )}
                  >
                    <n.icon size={16} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Menu
            trigger={(open) => (
              <button
                className={cn(
                  "flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition hover:bg-slate-100 sm:pr-3",
                  open && "bg-slate-100"
                )}
              >
                <Avatar name={user.name} size={32} />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight">{user.name}</span>
                  <span className="block text-xs leading-tight text-muted">{user.email}</span>
                </span>
                <ChevronDown size={15} className="hidden text-muted sm:block" />
              </button>
            )}
            items={[
              { label: "Profili", icon: <Settings size={16} />, onClick: () => router.push("/settings") },
              { label: "Dil", icon: <LogOut size={16} />, onClick: doLogout, danger: true },
            ]}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((n) => {
            const on = path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", on ? "text-brand-600" : "text-slate-400")}
              >
                <n.icon size={21} strokeWidth={on ? 2.4 : 2} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
