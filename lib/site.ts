import type { Metadata } from "next";

export const locales = ["nl", "ar"] as const;
export type Locale = (typeof locales)[number];

export const siteUrl = "https://www.arabischnederlandstolken.nl";
export const organizationName = "Arabisch Nederlands Tolkencollectief";

export const organizationContact = {
  email: "info@arabischnederlandstolken.nl",
};

const localeDefinitions = {
  nl: {
    lang: "nl",
    dir: "ltr",
    label: "Nederlands",
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    label: "العربية",
  },
} as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleDefinition(locale: Locale) {
  return localeDefinitions[locale];
}

export function localizedPath(locale: Locale, path: string) {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return normalized ? `/${locale}/${normalized}` : `/${locale}`;
}

export function absoluteUrl(path: string) {
  return `${siteUrl}${path}`;
}

export const organizationLogoUrl = absoluteUrl("/brand/logo-mark.webp");

const socialImage = {
  url: absoluteUrl("/brand/og-image.png"),
  width: 1200,
  height: 630,
  alt: "Arabisch Nederlands Tolkencollectief - Tolkdiensten voor duidelijke communicatie",
} as const;

export function buildMailtoHref(subject: string) {
  const query = new URLSearchParams({
    subject,
  });

  return `mailto:${organizationContact.email}?${query.toString()}`;
}

export function getContactActions(locale: Locale) {
  const contactHref = localizedPath(locale, "contact");

  return {
    general: {
      label:
        locale === "nl"
          ? "Stuur een tolkaanvraag"
          : "أرسل طلب مترجم شفهي",
      href: contactHref,
    },
    callback: {
      label:
        locale === "nl"
          ? "Beschrijf uw tolkvraag"
          : "اشرحوا طلب الترجمة",
      href: contactHref,
    },
    urgent: {
      label:
        locale === "nl"
          ? "Dien een spoedaanvraag in"
          : "أرسلوا طلباً عاجلاً",
      href: contactHref,
    },
    sworn: {
      label:
        locale === "nl"
          ? "Vraag een beëdigd tolk aan"
          : "اطلبوا مترجماً محلّفاً",
      href: contactHref,
    },
    official: {
      label:
        locale === "nl"
          ? "Vraag over een officiële afspraak"
          : "استفسروا عن موعد رسمي",
      href: contactHref,
    },
    municipality: {
      label:
        locale === "nl"
          ? "Aanvraag voor gemeentecontext"
          : "طلب لسياق بلدي",
      href: contactHref,
    },
    healthcare: {
      label:
        locale === "nl"
          ? "Aanvraag voor zorgcontext"
          : "طلب لسياق صحي",
      href: contactHref,
    },
    legal: {
      label:
        locale === "nl"
          ? "Aanvraag voor juridische context"
          : "طلب لسياق قانوني",
      href: contactHref,
    },
    followUp: {
      label:
        locale === "nl"
          ? "Neem contact op"
          : "تواصلوا معنا",
      href: contactHref,
    },
  };
}

function languageAlternates(path: string) {
  return {
    "nl-NL": absoluteUrl(localizedPath("nl", path)),
    ar: absoluteUrl(localizedPath("ar", path)),
    "x-default": absoluteUrl(localizedPath("nl", path)),
  };
}

type MetadataInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

export function createPageMetadata({
  locale,
  path,
  title,
  description,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, path));

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: organizationName,
      locale: locale === "nl" ? "nl_NL" : "ar",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
