import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";
import { baseFontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description: "De opgevraagde pagina bestaat niet of is verplaatst.",
};

export default function GlobalNotFound() {
  return (
    <html lang="nl" className={`${baseFontVariables} antialiased`}>
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand/65">
            Niet gevonden
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Deze pagina is niet beschikbaar.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            De URL bestaat niet of de pagina is nog niet gepubliceerd binnen de
            meertalige site-structuur. Ga verder via de Nederlandse of Arabische
            homepage.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/nl"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white"
            >
              Naar /nl
            </Link>
            <Link
              href="/ar"
              className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground"
            >
              Naar /ar
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
