"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthHeader, PasswordInput, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field, Input, cn } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const { login } = useStore();
  const { t } = useT();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError(t.auth.enterName);
    if (!email.includes("@")) return setError(t.common.invalidEmail);
    if (password.length < 8) return setError(t.common.pwMin8);
    setLoading(true);
    await fakeDelay();
    login(email, name.trim());
    router.replace("/clients");
  }

  return (
    <>
      <AuthHeader title={t.auth.registerTitle} text={t.auth.registerText} />
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.auth.fullName}>
          <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.auth.fullNamePh} />
        </Field>
        <Field label={t.common.email}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.common.emailPh} />
        </Field>
        <Field label={t.common.password} hint={t.auth.pwHint}>
          <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-colors",
                  i < strength ? (strength <= 1 ? "bg-red-500" : strength <= 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </Field>

        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}

        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : t.auth.createAccount}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          {t.auth.login}
        </Link>
      </p>
    </>
  );
}
