import type { Metadata } from "next";

export const locales = ["nl", "ar"] as const;
export type Locale = (typeof locales)[number];

export const siteUrl = "https://arabischnederlandstolken.nl";
export const organizationName = "Arabisch Nederlands Tolkencollectief";

export const organizationContact = {
  email: "info@arabischnederlandstolken.nl",
};

const contactActionSubjects = {
  nl: {
    general: "Aanvraag Arabisch-Nederlands tolk",
    callback: "Vraag over Arabisch-Nederlandse tolkdienst",
    urgent: "Spoedaanvraag Arabisch-Nederlands tolk",
    sworn: "Aanvraag beëdigd tolk Arabisch-Nederlands",
    official: "Aanvraag officiële afspraak Arabisch-Nederlands tolk",
    municipality: "Aanvraag gemeentecontext Arabisch-Nederlands tolk",
    healthcare: "Aanvraag zorgcontext Arabisch-Nederlands tolk",
    legal: "Aanvraag juridische context Arabisch-Nederlands tolk",
    followUp: "Vraag over Arabisch-Nederlandse tolkdienst",
  },
  ar: {
    general: "طلب مترجم شفهي عربي هولندي",
    callback: "استفسار عن خدمة الترجمة الشفهية العربية الهولندية",
    urgent: "طلب عاجل لمترجم شفهي عربي هولندي",
    sworn: "طلب مترجم محلّف عربي هولندي",
    official: "طلب لموعد رسمي مع مترجم عربي هولندي",
    municipality: "طلب ترجمة شفهية لسياق بلدي",
    healthcare: "طلب ترجمة شفهية لسياق صحي",
    legal: "طلب ترجمة شفهية لسياق قانوني",
    followUp: "استفسار عن خدمة الترجمة الشفهية العربية الهولندية",
  },
} as const;

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

export function buildMailtoHref(subject: string) {
  const query = new URLSearchParams({
    subject,
  });

  return `mailto:${organizationContact.email}?${query.toString()}`;
}

export function getContactActions(locale: Locale) {
  const subjects = contactActionSubjects[locale];

  return {
    general: {
      label:
        locale === "nl"
          ? "Stuur een tolkaanvraag"
          : "أرسل طلب مترجم شفهي",
      href: buildMailtoHref(subjects.general),
    },
    callback: {
      label:
        locale === "nl"
          ? "Bespreek uw situatie per e-mail"
          : "ناقش طلبك عبر البريد الإلكتروني",
      href: buildMailtoHref(subjects.callback),
    },
    urgent: {
      label:
        locale === "nl"
          ? "Mail een spoedaanvraag"
          : "أرسل طلباً عاجلاً بالبريد",
      href: buildMailtoHref(subjects.urgent),
    },
    sworn: {
      label:
        locale === "nl"
          ? "Mail een aanvraag voor een beëdigd tolk"
          : "أرسل طلب مترجم محلّف بالبريد",
      href: buildMailtoHref(subjects.sworn),
    },
    official: {
      label:
        locale === "nl"
          ? "Mail uw vraag over een officiële afspraak"
          : "أرسل استفسارك عن موعد رسمي",
      href: buildMailtoHref(subjects.official),
    },
    municipality: {
      label:
        locale === "nl"
          ? "Mail een aanvraag voor gemeentecontext"
          : "أرسل طلباً لسياق بلدي",
      href: buildMailtoHref(subjects.municipality),
    },
    healthcare: {
      label:
        locale === "nl"
          ? "Mail een aanvraag voor zorgcontext"
          : "أرسل طلباً لسياق صحي",
      href: buildMailtoHref(subjects.healthcare),
    },
    legal: {
      label:
        locale === "nl"
          ? "Mail een aanvraag voor juridische context"
          : "أرسل طلباً لسياق قانوني",
      href: buildMailtoHref(subjects.legal),
    },
    followUp: {
      label:
        locale === "nl"
          ? "Stel uw vraag per e-mail"
          : "أرسل استفسارك بالبريد الإلكتروني",
      href: buildMailtoHref(subjects.followUp),
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
