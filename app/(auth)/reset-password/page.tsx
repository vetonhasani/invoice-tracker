"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { AuthHeader, PasswordInput, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field } from "@/components/ui";
import { useT } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const { t } = useT();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) return setError(t.common.pwMin8);
    if (pw !== pw2) return setError(t.auth.pwMismatch);
    setLoading(true);
    await fakeDelay();
    setLoading(false);
    setDone(true);
  }

  if (done)
    return (
      <>
        <AuthHeader
          icon={<CircleCheck size={22} className="text-emerald-600" />}
          title={t.auth.pwChanged}
          text={t.auth.pwChangedText}
        />
        <Link href="/login">
          <Button size="lg" className="w-full">{t.auth.login}</Button>
        </Link>
      </>
    );

  return (
    <>
      <AuthHeader icon={<Lock size={22} />} title={t.auth.resetTitle} text={t.auth.resetText} />
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.auth.newPw}>
          <PasswordInput autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoFocus />
        </Field>
        <Field label={t.auth.repeatPw}>
          <PasswordInput autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : t.auth.savePw}
        </Button>
      </form>
    </>
  );
}
