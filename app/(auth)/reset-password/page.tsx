"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleCheck, Lock } from "lucide-react";
import { AuthHeader, PasswordInput, Spinner, fakeDelay } from "@/components/auth-bits";
import { Button, Field } from "@/components/ui";

export default function ResetPasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) return setError("Fjalëkalimi duhet të ketë të paktën 8 karaktere.");
    if (pw !== pw2) return setError("Fjalëkalimet nuk përputhen.");
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
          title="Fjalëkalimi u ndryshua"
          text="Tani mund të kyçesh me fjalëkalimin e ri."
        />
        <Link href="/login">
          <Button size="lg" className="w-full">Kyçu</Button>
        </Link>
      </>
    );

  return (
    <>
      <AuthHeader icon={<Lock size={22} />} title="Vendos fjalëkalim të ri" text="Zgjidh një fjalëkalim që nuk e ke përdorur më parë." />
      <form onSubmit={submit} className="space-y-4">
        <Field label="Fjalëkalimi i ri">
          <PasswordInput autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" autoFocus />
        </Field>
        <Field label="Përsërite fjalëkalimin">
          <PasswordInput autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" />
        </Field>
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">{error}</p>}
        <Button size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Ruaj fjalëkalimin"}
        </Button>
      </form>
    </>
  );
}
