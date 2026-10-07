# Project notes for Claude Code

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (theme tokens in `app/globals.css`), lucide-react icons, Geist font.
- UI language is **Albanian** — keep all user-facing text in Albanian. Labels come from the original Excel: Materiali, Data, Sasia, Vlera, Çmimi, Total.
- Currently **UI only**: all data goes through `lib/store.tsx` (`useStore()`), mock data in `lib/seed.ts`, persisted to localStorage. Pages must not touch storage directly, so the store can later be swapped for Turso + server actions.
- Entries keep a price/name/unit snapshot; catalog price changes must not alter existing entries.
- Every screen must work on mobile (bottom nav, FAB, bottom-sheet modals) and desktop (top nav, tables, centered modals). Use the shared components in `components/ui.tsx`.
- Check with `npm run build` before finishing.
