import type { Metadata } from "next";

export const locales = ["nl", "ar"] as const;
export type Locale = (typeof locales)[number];

export const siteUrl = "https://arabischnederlandstolken.nl";
export const organizationName = "Arabisch Nederlands Tolkencollectief";

export const organizationContact = {
  email: "info@arabischnederlandstolken.nl",
  phoneLabel: "Telefoonnummer op aanvraag",
  whatsappLabel: "WhatsApp op aanvraag",
  officeHoursNl:
    "Maandag tot en met vrijdag bereikbaar voor intake, planning en terugbelverzoeken.",
  officeHoursAr:
    "متاحون من الإثنين إلى الجمعة لطلبات الحجز والاتصال والمتابعة الأولية.",
};

export const contactActionSubjects = {
  general: "Aanvraag Arabisch-Nederlands tolk",
  callback: "Terugbelverzoek Arabisch-Nederlands tolk",
  urgent: "Spoedaanvraag Arabisch-Nederlands tolk",
  sworn: "Aanvraag beëdigd tolk Arabisch-Nederlands",
  official: "Officiële afspraak Arabisch-Nederlands tolk",
  municipality: "Aanvraag gemeentecontext Arabisch-Nederlands tolk",
  healthcare: "Aanvraag zorgcontext Arabisch-Nederlands tolk",
  legal: "Aanvraag juridische context Arabisch-Nederlands tolk",
  whatsapp: "Verzoek WhatsApp-terugkoppeling tolkdienst",
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

export function buildMailtoHref(subject: string) {
  const query = new URLSearchParams({
    subject,
  });

  return `mailto:${organizationContact.email}?${query.toString()}`;
}

export function getContactActions(locale: Locale) {
  return {
    general: {
      label:
        locale === "nl"
          ? "Plan een tolkgesprek"
          : "ابدأ طلب مترجم شفهي",
      href: buildMailtoHref(contactActionSubjects.general),
    },
    callback: {
      label:
        locale === "nl"
          ? "Vraag een terugbelverzoek aan"
          : "اطلب اتصالاً",
      href: buildMailtoHref(contactActionSubjects.callback),
    },
    urgent: {
      label:
        locale === "nl"
          ? "Dien een spoedaanvraag in"
          : "أرسل طلباً عاجلاً",
      href: buildMailtoHref(contactActionSubjects.urgent),
    },
    sworn: {
      label:
        locale === "nl"
          ? "Vraag een beëdigd tolk aan"
          : "اطلب مترجماً محلّفاً",
      href: buildMailtoHref(contactActionSubjects.sworn),
    },
    official: {
      label:
        locale === "nl"
          ? "Plan een officiële afspraak"
          : "نسّق موعداً رسمياً",
      href: buildMailtoHref(contactActionSubjects.official),
    },
    municipality: {
      label:
        locale === "nl"
          ? "Aanvraag voor gemeentecontext"
          : "طلب لجهة بلدية",
      href: buildMailtoHref(contactActionSubjects.municipality),
    },
    healthcare: {
      label:
        locale === "nl"
          ? "Aanvraag voor zorgcontext"
          : "طلب لجهة صحية",
      href: buildMailtoHref(contactActionSubjects.healthcare),
    },
    legal: {
      label:
        locale === "nl"
          ? "Aanvraag voor juridische context"
          : "طلب لسياق قانوني",
      href: buildMailtoHref(contactActionSubjects.legal),
    },
    whatsapp: {
      label:
        locale === "nl"
          ? "Vraag een WhatsApp-terugkoppeling aan"
          : "اطلب متابعة عبر واتساب",
      href: buildMailtoHref(contactActionSubjects.whatsapp),
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
