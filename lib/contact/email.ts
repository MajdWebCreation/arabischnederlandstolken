import "server-only";

import { Resend } from "resend";
import type { ContactFormData } from "@/lib/contact/schema";
import type {
  ContactContext,
  DeliveryMode,
  LanguageDirection,
  RequestType,
} from "@/lib/contact/types";
import type { Locale } from "@/lib/site";

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

export async function sendContactEmail(
  data: ContactFormData,
  locale: Locale,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_FORM_TO_EMAIL;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;

  if (
    !isSafeConfigurationValue(apiKey) ||
    !isSafeConfigurationValue(to) ||
    !isSafeConfigurationValue(from)
  ) {
    return false;
  }

  const subject = `[Website] ${requestTypeLabels[data.requestType]} | ${
    languageDirectionLabels[data.languageDirection]
  }`;

  try {
    const { error } = await getResend(apiKey!).emails.send({
      from: from!.trim(),
      to: to!.trim(),
      replyTo: data.email,
      subject,
      text: buildEmailText(data, locale),
    });

    return !error;
  } catch {
    return false;
  }
}
