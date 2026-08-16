import type { Metadata } from "next";
import "../globals.css";
import { baseFontVariables } from "@/lib/fonts";

// The admin area is a separate top-level route tree from the public,
// locale-prefixed site (matching the existing app/(root) and app/[locale]
// split), so it needs its own root layout with <html>/<body>.
export const metadata: Metadata = {
  title: "Beheer | Arabisch Nederlands Tolken",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${baseFontVariables} antialiased`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
