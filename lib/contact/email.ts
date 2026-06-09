import "server-only";

import { Resend } from "resend";
import type { ContactFormData } from "@/lib/contact/schema";
import type {
  ContactContext,
  DeliveryMode,
  LanguageDirection,
  RequestType,
} from "@/lib/contact/types";
import {
  absoluteUrl,
  organizationName,
  type Locale,
} from "@/lib/site";

let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

const requestTypeLabels: Record<RequestType, string> = {
  regular: "Reguliere aanvraag",
  urgent: "Spoed aangegeven",
  sworn: "Beëdigde tolk gevraagd",
  availability: "Beschikbaarheidsvraag",
  other: "Andere aanvraag",
};

const contextLabels: Record<ContactContext, string> = {
  healthcare: "Zorg",
  municipality: "Gemeente",
  legal: "Juridisch",
  migration: "Migratie / IND",
  business: "Zakelijk",
  other: "Anders",
};

const languageDirectionLabels: Record<LanguageDirection, string> = {
  ar_to_nl: "Arabisch naar Nederlands",
  nl_to_ar: "Nederlands naar Arabisch",
  both_or_unknown: "Beide richtingen / nog onbekend",
};

const deliveryModeLabels: Record<DeliveryMode, string> = {
  phone: "Telefonisch",
  video: "Video",
  on_location: "Op locatie",
  unknown: "Nog onbekend",
};

const confirmationCopy: Record<
  Locale,
  {
    subject: string;
    heading: string;
    received: string;
    review: string;
    privacy: string;
    automatic: string;
    lang: string;
    dir: "ltr" | "rtl";
  }
> = {
  nl: {
    subject: "Ontvangstbevestiging van uw tolkaanvraag",
    heading: "Uw tolkaanvraag is ontvangen",
    received:
      "We hebben uw aanvraag via arabischnederlandstolken.nl ontvangen.",
    review:
      "We bekijken de aanvraag en nemen contact met u op wanneer er voldoende informatie beschikbaar is om deze verder te beoordelen.",
    privacy:
      "Stuur geen aanvullende gevoelige documenten via e-mail, zoals medische dossiers, BSN’s of processtukken, tenzij wij daar specifiek om vragen.",
    automatic: "Deze ontvangstbevestiging is automatisch verzonden.",
    lang: "nl",
    dir: "ltr",
  },
  ar: {
    subject: "تأكيد استلام طلبكم للترجمة الشفهية",
    heading: "تم استلام طلبكم للترجمة الشفهية",
    received:
      "لقد استلمنا طلبكم المرسل عبر arabischnederlandstolken.nl.",
    review:
      "سنراجع الطلب ونتواصل معكم عندما تكون المعلومات المتاحة كافية لمتابعة تقييمه.",
    privacy:
      "يرجى عدم إرسال مستندات حساسة إضافية عبر البريد الإلكتروني، مثل الملفات الطبية أو أرقام BSN أو مستندات القضايا، إلا إذا طلبنا ذلك منكم صراحةً.",
    automatic: "تم إرسال رسالة التأكيد هذه تلقائياً.",
    lang: "ar",
    dir: "rtl",
  },
};

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function isSafeConfigurationValue(value: string | undefined) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_FORM_TO_EMAIL;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;

  if (
    !isSafeConfigurationValue(apiKey) ||
    !isSafeConfigurationValue(to) ||
    !isSafeConfigurationValue(from)
  ) {
    return null;
  }

  return {
    apiKey: apiKey!.trim(),
    to: to!.trim(),
    from: from!.trim(),
  };
}

function buildEmailText(data: ContactFormData, locale: Locale) {
  const lines = [
    "Nieuwe tolkaanvraag via arabischnederlandstolken.nl",
    "",
    `Naam: ${singleLine(data.name)}`,
    `E-mail: ${singleLine(data.email)}`,
    data.phone ? `Telefoon: ${singleLine(data.phone)}` : undefined,
    data.organization
      ? `Organisatie: ${singleLine(data.organization)}`
      : undefined,
    `Soort aanvraag: ${requestTypeLabels[data.requestType]}`,
    `Context: ${contextLabels[data.context]}`,
    `Taalrichting: ${languageDirectionLabels[data.languageDirection]}`,
    data.deliveryMode
      ? `Inzetvorm: ${deliveryModeLabels[data.deliveryMode]}`
      : undefined,
    data.desiredDateTime
      ? `Gewenste datum/tijd: ${singleLine(data.desiredDateTime)}`
      : undefined,
    `Taal van het formulier: ${locale}`,
    `Ingediend op: ${new Date().toISOString()}`,
    "",
    "Bericht:",
    data.message.replace(/\r\n?/g, "\n").trim(),
  ];

  return lines.filter((line): line is string => line !== undefined).join("\n");
}

function buildConfirmationText(locale: Locale) {
  const copy = confirmationCopy[locale];

  return [
    copy.heading,
    "",
    copy.received,
    "",
    copy.review,
    "",
    copy.privacy,
    "",
    copy.automatic,
    organizationName,
  ].join("\n");
}

function buildConfirmationHtml(locale: Locale) {
  const copy = confirmationCopy[locale];
  const alignment = copy.dir === "rtl" ? "right" : "left";
  const logoUrl = absoluteUrl("/brand/logo-email.png");

  return `<!doctype html>
<html lang="${copy.lang}" dir="${copy.dir}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${copy.subject}</title>
  </head>
  <body style="margin:0;background:#f4f0e8;color:#0f223f;font-family:Arial,'Helvetica Neue',sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f0e8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fffdf9;border:1px solid #d6d1c7;border-radius:20px;">
            <tr>
              <td dir="${copy.dir}" align="${alignment}" style="padding:32px;color:#0f223f;text-align:${alignment};">
                <img src="${logoUrl}" width="112" alt="${organizationName}" style="display:block;width:112px;max-width:100%;height:auto;margin:0 0 24px;">
                <h1 style="margin:0 0 20px;font-size:24px;line-height:1.35;color:#0c2444;">${copy.heading}</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#3d4c63;">${copy.received}</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#3d4c63;">${copy.review}</p>
                <p style="margin:24px 0;padding:16px;border-${copy.dir === "rtl" ? "right" : "left"}:4px solid #b88a4a;background:#f8f3eb;font-size:15px;line-height:1.7;color:#3d4c63;">${copy.privacy}</p>
                <p style="margin:0;font-size:13px;line-height:1.65;color:#5e6b80;">${copy.automatic}</p>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.65;color:#5e6b80;">${organizationName}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendContactEmail(
  data: ContactFormData,
  locale: Locale,
) {
  const configuration = getEmailConfiguration();

  if (!configuration) {
    return false;
  }

  const subject = `[Website] ${requestTypeLabels[data.requestType]} | ${
    languageDirectionLabels[data.languageDirection]
  }`;

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: configuration.to,
      replyTo: data.email,
      subject,
      text: buildEmailText(data, locale),
    });

    return !error;
  } catch {
    return false;
  }
}

export async function sendContactConfirmationEmail(
  email: string,
  locale: Locale,
) {
  const configuration = getEmailConfiguration();

  if (!configuration || !isSafeConfigurationValue(email)) {
    return false;
  }

  const copy = confirmationCopy[locale];

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: email.trim(),
      replyTo: configuration.to,
      subject: copy.subject,
      html: buildConfirmationHtml(locale),
      text: buildConfirmationText(locale),
    });

    return !error;
  } catch {
    return false;
  }
}
