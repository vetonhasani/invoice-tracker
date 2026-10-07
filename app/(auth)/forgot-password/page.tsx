"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import { AuthHeader, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Shkruaj një email të vlefshëm.");
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
          title="Kontrollo emailin"
          text={
            <>
              Të kemi dërguar një link për ta ndryshuar fjalëkalimin te <b className="text-ink">{email}</b>.
            </>
          }
        />
        <div className="space-y-3">
          {/* In the real app this link arrives by email */}
          <Link href="/reset-password" className="block">
            <Button size="lg" className="w-full">Hap linkun (demo)</Button>
          </Link>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => setSent(false)}>
            Nuk e more? Dërgo përsëri
          </Button>
        </div>
        <BackToLogin />
      </>
    );

  return (
    <>
      <AuthHeader
        icon={<KeyRound size={22} />}
        title="Harrove fjalëkalimin?"
        text="Shkruaj emailin dhe do të të dërgojmë një link për ta ndryshuar."
      />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" error={error}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="emri@shembull.com" autoFocus />
        </Field>
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Dërgo linkun"}
        </Button>
      </form>
      <BackToLogin />
    </>
  );
}

function BackToLogin() {
  return (
    <Link href="/login" className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-ink">
      <ArrowLeft size={16} /> Kthehu te kyçja
    </Link>
  );
}
