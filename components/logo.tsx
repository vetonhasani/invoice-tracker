import { cn } from "./ui";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5 font-bold tracking-tight", className)}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-[10px]",
          light ? "bg-white text-brand-700" : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_2px_6px_rgb(37_87_235/.35)]"
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M9 12h7M9 16h5" />
        </svg>
      </span>
      <span className={light ? "text-white" : "text-ink"}>Invoice Tracker</span>
    </span>
  );
}
