import { cn } from "./ui";

export function PageHeader({
  title,
  subtitle,
  actions,
  leading,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-4">
        {leading}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
          {subtitle && <div className="mt-1 text-[15px] text-muted">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="hidden items-center gap-2 sm:flex">{actions}</div>}
    </div>
  );
}

/** Floating action button for mobile. */
export function Fab({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 items-center gap-2 rounded-full bg-brand-600 pl-5 pr-6 font-semibold text-white shadow-[0_10px_24px_-6px_rgb(37_87_235/.55)] active:scale-95 sm:hidden"
    >
      {children}
    </button>
  );
}
