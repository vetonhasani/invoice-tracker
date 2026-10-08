"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { AuthHeader, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field, Input } from "@/components/ui";
import { useT } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError(t.common.invalidEmail);
    setLoading(true);
    await fakeDelay();
    setLoading(false);
    setSent(true);
  }

  if (sent)
    return (
      <>
        <AuthHeader
          icon={<Mail size={22} />}
          title={t.auth.checkEmail}
          text={
            <>
              {t.auth.sentTo} <b className="text-ink">{email}</b>.
            </>
          }
        />
        <div className="space-y-3">
          {/* In the real app this link arrives by email */}
          <Link href="/reset-password" className="block">
            <Button size="lg" className="w-full">{t.auth.openLink}</Button>
          </Link>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => setSent(false)}>
            {t.auth.resend}
          </Button>
        </div>
        <BackToLogin />
      </>
    );

  return (
    <>
      <AuthHeader icon={<KeyRound size={22} />} title={t.auth.forgot} text={t.auth.forgotText} />
      <form onSubmit={submit} className="space-y-4">
        <Field label={t.common.email} error={error}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.common.emailPh} autoFocus />
        </Field>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : t.auth.sendLink}
        </Button>
      </form>
      <BackToLogin />
    </>
  );
}

function BackToLogin() {
  const { t } = useT();
  return (
    <Link href="/login" className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-ink">
      <ArrowLeft size={16} /> {t.auth.backToLogin}
    </Link>
  );
}
