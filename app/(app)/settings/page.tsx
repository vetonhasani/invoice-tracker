"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, RotateCcw, User } from "lucide-react";
import { PasswordInput, fakeDelay } from "@/components/auth-bits";
import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, Confirm, Field, Input } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { user, login, logout, resetDemo } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwErr, setPwErr] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <PageHeader title="Profili" subtitle="Të dhënat e llogarisë dhe fjalëkalimi" />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Section icon={<User size={18} />} title="Të dhënat personale">
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={name || user.name} size={56} />
            <div>
              <div className="font-semibold">{name || user.name}</div>
              <div className="text-sm text-muted">{email}</div>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login(email, name);
              toast("Profili u ruajt");
            }}
          >
            <Field label="Emri">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button>Ruaj ndryshimet</Button>
          </form>
        </Section>

        <Section icon={<KeyRound size={18} />} title="Ndrysho fjalëkalimin">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setPwErr("");
              if (!pw.current) return setPwErr("Shkruaj fjalëkalimin aktual.");
              if (pw.next.length < 8) return setPwErr("Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.");
              await fakeDelay(400);
              setPw({ current: "", next: "" });
              toast("Fjalëkalimi u ndryshua");
            }}
          >
            <Field label="Fjalëkalimi aktual">
              <PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••••" />
            </Field>
            <Field label="Fjalëkalimi i ri" error={pwErr}>
              <PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="••••••••" />
            </Field>
            <Button variant="secondary">Ndrysho fjalëkalimin</Button>
          </form>
        </Section>
      </div>

      <Card className="mt-5 divide-y divide-line">
        <Row
          title="Rikthe të dhënat demo"
          text="Kthen klientët dhe materialet shembull (vetëm për versionin pa databazë)."
          action={<Button variant="secondary" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> Rikthe</Button>}
        />
        <Row
          title="Dil nga llogaria"
          text="Do të duhet të kyçesh përsëri."
          action={
            <Button
              variant="secondary"
              className="text-red-600"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              <LogOut size={15} /> Dil
            </Button>
          }
        />
      </Card>

      <Confirm
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          toast("Të dhënat demo u rikthyen");
        }}
        title="Rikthe të dhënat demo?"
        text="Ndryshimet e tua në klientë dhe materiale do të humbin."
        confirmLabel="Rikthe"
      />
    </>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-2.5 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Row({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-6">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted">{text}</div>
      </div>
      {action}
    </div>
  );
}
