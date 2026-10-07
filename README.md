# Invoice Tracker

Next.js app for tracking materials per client (replaces the `Invoice_Tracker.xlsx` sheet).
**UI only for now**: no database. Data is mock data in React state, saved to `localStorage`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. Log in with **any email + any password (4+ chars)**.

## Screens

| Route | Screen |
|---|---|
| `/login` | Kyçu (login) |
| `/register` | Krijo llogari (sign up) |
| `/forgot-password` | Harrove fjalëkalimin → "Kontrollo emailin" |
| `/reset-password` | Vendos fjalëkalim të ri |
| `/clients` | Klientët: list, search, add / edit / delete client |
| `/clients/[id]` | One client's sheet: Materiali · Data · Sasia · Vlera · Çmimi + Total, month filter, add / edit / delete, print |
| `/materials` | Katalogu: materials with unit + price (Vlera) |
| `/settings` | Profili: name/email, change password, reset demo data, logout |

Logout: user menu (top right) or Profili page.

## How "Shto material" works

1. Add materials once in **Materialet** with their price.
2. In a client, click **Shto material** → search & pick the material → **Vlera autofills** → type only **Sasia**.
3. Çmimi = Sasia × Vlera. Typing a name that doesn't exist offers "Shto në katalog".
4. Each client row stores a **snapshot** of name/unit/price, so changing a catalog price doesn't change old rows.

## Structure

```
app/(auth)/…          login, register, forgot/reset password (+ split-screen layout)
app/(app)/…           authenticated pages (+ header, mobile bottom nav, auth guard)
components/ui.tsx     Button, Input, Field, Modal (bottom sheet on mobile), Menu, Stat, Avatar…
components/entry-form.tsx   add material to client (catalog picker + autofill)
lib/store.tsx         mock data layer (React context + localStorage)  ← replace with Turso
lib/seed.ts           demo data
lib/types.ts          Client, Material, Entry, User
```

## Next steps (planned)

- Turso (libSQL) + Drizzle: tables `users`, `clients`, `materials`, `entries` matching `lib/types.ts`
- Real auth (e.g. Auth.js / Better Auth) with password reset emails
- Deploy on Vercel
