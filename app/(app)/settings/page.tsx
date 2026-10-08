"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, RotateCcw, User } from "lucide-react";
import { PasswordInput, fakeDelay } from "@/components/auth-bits";
import { PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, Confirm, Field, Input, LangSwitch } from "@/components/ui";
import { useToast } from "@/components/toast";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { user, login, logout, resetDemo } = useStore();
  const { t } = useT();
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
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Section icon={<User size={18} />} title={t.settings.personal}>
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
              toast(t.settings.saved);
            }}
          >
            <Field label={t.settings.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t.common.email}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Button>{t.common.saveChanges}</Button>
          </form>
        </Section>

        <Section icon={<KeyRound size={18} />} title={t.settings.changePw}>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setPwErr("");
              if (!pw.current) return setPwErr(t.settings.enterCurrentPw);
              if (pw.next.length < 8) return setPwErr(t.settings.newPwMin);
              await fakeDelay(400);
              setPw({ current: "", next: "" });
              toast(t.settings.pwChanged);
            }}
          >
            <Field label={t.settings.currentPw}>
              <PasswordInput value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••••" />
            </Field>
            <Field label={t.settings.newPw} error={pwErr}>
              <PasswordInput value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="••••••••" />
            </Field>
            <Button variant="secondary">{t.settings.changePw}</Button>
          </form>
        </Section>
      </div>

      <Card className="mt-5 divide-y divide-line">
        <Row title={t.lang.label} text={t.lang.text} action={<LangSwitch />} />
        <Row
          title={t.settings.resetTitle}
          text={t.settings.resetText}
          action={<Button variant="secondary" onClick={() => setResetOpen(true)}><RotateCcw size={15} /> {t.settings.reset}</Button>}
        />
        <Row
          title={t.settings.logoutTitle}
          text={t.settings.logoutText}
          action={
            <Button
              variant="secondary"
              className="text-red-600"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
            >
              <LogOut size={15} /> {t.common.logout}
            </Button>
          }
        />
      </Card>

      <Confirm
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemo();
          toast(t.settings.resetDone);
        }}
        title={t.settings.resetConfirmTitle}
        text={t.settings.resetConfirmText}
        confirmLabel={t.settings.reset}
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
