"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthHeader, PasswordInput, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login } = useStore();
  const { t } = useT();
  const router = useRouter();
  const [email, setEmail] = useState("veton@example.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError(t.common.invalidEmail);
    if (password.length < 4) return setError(t.auth.pwMin4);
    setLoading(true);
    await fakeDelay();
    login(email, email.startsWith("veton") ? "Veton Hasani" : undefined);
    router.replace("/clients");
  }

  return (
    <>
      <AuthHeader title={t.auth.welcome} text={t.auth.welcomeText} />
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.common.email}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.common.emailPh} />
        </Field>
        <Field
          label={t.common.password}
          right={
            <Link href="/forgot-password" className="text-[13px] font-semibold text-brand-600 hover:text-brand-700">
              {t.auth.forgot}
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-brand-600" />
          {t.auth.remember}
        </label>

        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}

        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : t.auth.login}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          {t.auth.register}
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-slate-400">{t.auth.demo}</p>
    </>
  );
}
