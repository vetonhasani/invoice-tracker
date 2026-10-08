"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { LangSwitch } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useStore();
  const { t } = useT();
  const router = useRouter();
  const path = usePathname();

  // Already logged in → go to the app (except on reset-password, which is reached from an email link)
  useEffect(() => {
    if (ready && user && path !== "/reset-password") router.replace("/clients");
  }, [ready, user, path, router]);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)",
          }}
        />
        <Logo light className="relative text-lg" />
        <div className="relative my-auto max-w-md">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-[44px]">
            {t.auth.headline}
          </h1>
          <p className="mt-4 text-lg text-brand-100">{t.auth.tagline}</p>

          {/* Preview card */}
          <div className="mt-10 rotate-[-1.5deg] rounded-2xl bg-white p-5 text-ink shadow-2xl shadow-brand-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">AK</span>
                <div>
                  <div className="font-semibold">Arben Krasniqi</div>
                  <div className="text-xs text-muted">{t.common.materialsCount(6)}</div>
                </div>
              </div>
              <div className="tabular text-right">
                <div className="text-xs text-muted">{t.clients.colTotal}</div>
                <div className="font-bold">107,400 Den</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ["Çimento 25kg", "40 × 400 Den", "16,000 Den"],
                ["Tulla 25×12", "500 × 26 Den", "13,000 Den"],
                ["Hekur armature Ø12", "80 × 485 Den", "38,800 Den"],
              ].map(([a, b, c]) => (
                <div key={a} className="tabular flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium">{a}</span>
                  <span className="text-muted">{b}</span>
                  <span className="font-semibold">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} Invoice Tracker</p>
      </aside>

      {/* Form side */}
      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Logo className="lg:hidden" />
          <LangSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-start pt-14 pb-10 sm:justify-center sm:py-10">{children}</div>
      </main>
    </div>
  );
}
