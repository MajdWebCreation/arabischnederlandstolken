import type { Metadata } from "next";
import "../globals.css";
import { baseFontVariables } from "@/lib/fonts";

// A separate top-level route tree from both the public site and /admin,
// matching the existing app/(root) / app/[locale] / app/admin split - each
// needs its own root layout with <html>/<body> since there is no shared
// top-level app/layout.tsx in this project.
export const metadata: Metadata = {
  title: "Tolkenportaal | Arabisch Nederlands Tolken",
  robots: { index: false, follow: false },
};

export default function InterpreterRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${baseFontVariables} antialiased`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
