"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui";
import { useT } from "@/lib/i18n";

export function AuthHeader({ icon, title, text }: { icon?: React.ReactNode; title: string; text: React.ReactNode }) {
  return (
    <div className="mb-8">
      {icon && (
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white text-brand-600 shadow-card">
          {icon}
        </div>
      )}
      <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-[15px] text-muted">{text}</p>
    </div>
  );
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { t } = useT();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:text-ink"
        aria-label={show ? t.common.hidePassword : t.common.showPassword}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

export function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

/** Fake network delay so loading states are visible in the UI-only build. */
export const fakeDelay = (ms = 700) => new Promise((r) => setTimeout(r, ms));
