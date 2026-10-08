import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/toast";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoice Tracker",
  description: "Materials and prices for every client",
};

export const viewport: Viewport = { themeColor: "#f6f7fb", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider>
          <StoreProvider>
            <ToastProvider>{children}</ToastProvider>
          </StoreProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
