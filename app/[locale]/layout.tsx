import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { JsonLd } from "@/components/site/json-ld";
import { PageShell } from "@/components/site/page-shell";
import { arabicFontVariable, baseFontVariables } from "@/lib/fonts";
import {
  absoluteUrl,
  createPageMetadata,
  getLocaleDefinition,
  isLocale,
  locales,
  organizationContact,
  organizationLogoUrl,
  organizationName,
  type Locale,
} from "@/lib/site";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return createPageMetadata({
    locale,
    path: "",
    title:
      locale === "nl"
        ? "Arabisch-Nederlands tolkencollectief"
        : "مجموعة ترجمة شفهية عربية هولندية",
    description:
      locale === "nl"
        ? "Professionele Arabisch-Nederlandse tolken voor zorg, overheid, advocatuur, rechtbanken en migratiegesprekken in Nederland."
        : "مجموعة مترجمين شفهيين عربيين هولنديين للمجالات الحكومية والطبية والقانونية والهجرة في هولندا.",
  });
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const localeDefinition = getLocaleDefinition(locale);
  const localeFontVariables =
    locale === "ar"
      ? `${baseFontVariables} ${arabicFontVariable}`
      : baseFontVariables;
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: organizationName,
    url: absoluteUrl(`/${locale}`),
    logo: organizationLogoUrl,
    availableLanguage: [
      "Dutch",
      "Arabic",
      locale === "nl" ? "Nederlands" : "العربية",
    ],
    email: organizationContact.email,
    serviceType:
      locale === "nl"
        ? "Arabisch-Nederlandse tolkdiensten"
        : "خدمات الترجمة الشفهية العربية الهولندية",
    knowsAbout: [
      "Zorgtolk",
      "Gemeente gesprekken",
      "Advocatuur",
      "Rechtbank",
      "IND en migratie",
    ],
  };

  return (
    <html
      lang={localeDefinition.lang}
      dir={localeDefinition.dir}
      className={`${localeFontVariables} antialiased`}
    >
      <body className="bg-background text-foreground">
        <JsonLd data={organizationJsonLd} />
        <PageShell locale={locale as Locale}>{children}</PageShell>
      </body>
    </html>
  );
}
