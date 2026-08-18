import "server-only";

import { Resend } from "resend";
import { absoluteUrl, organizationName } from "@/lib/site";
import {
  getResendConfiguration,
  isSafeEmailAddress,
  renderBrandedEmailHtml,
  renderDetailRowsHtml,
} from "@/lib/email/layout";
import {
  BOOKING_MODALITY_LABELS,
  languageLabel,
  type BookingModality,
} from "@/lib/bookings/constants";
import { formatNumberAsCurrency } from "@/lib/money";

let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

/** The minimal booking shape every customer-facing email needs - kept narrow so callers don't have to fetch more than this. */
export type CustomerEmailBooking = {
  id: string;
  booking_number: string;
  requested_date: string | null;
  requested_start_time: string | null;
  expected_duration_minutes: number | null;
  modality: string | null;
  language_from: string;
  language_to: string;
  sworn_required: boolean;
  customer_price_ex_vat?: number | null;
  customer_travel_fee_ex_vat?: number | null;
  customer_overtime_rate_ex_vat?: number | null;
  vat_rate?: number;
};

function formatDutchDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
  });
}

function formatDutchDateWithYear(value: string | null): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function bookingDetailRows(booking: CustomerEmailBooking): Array<[string, string]> {
  const rows: Array<[string, string]> = [
    ["Boekingnummer", booking.booking_number],
  ];

  const date = formatDutchDateWithYear(booking.requested_date);
  if (date) rows.push(["Datum", date]);
  if (booking.requested_start_time) {
    rows.push(["Tijd", booking.requested_start_time.slice(0, 5)]);
  }
  if (booking.expected_duration_minutes) {
    rows.push(["Verwachte duur", `${booking.expected_duration_minutes} minuten`]);
  }
  if (booking.modality) {
    rows.push([
      "Inzetvorm",
      BOOKING_MODALITY_LABELS[booking.modality as BookingModality] ?? booking.modality,
    ]);
  }
  rows.push([
    "Taalcombinatie",
    `${languageLabel(booking.language_from)} ↔ ${languageLabel(booking.language_to)}`,
  ]);
  if (booking.sworn_required) {
    rows.push(["Beëdiging", "Beëdigd tolk vereist"]);
  }

  return rows;
}

function portalUrl(bookingId: string) {
  return absoluteUrl(`/klant/opdrachten/${bookingId}`);
}

async function send(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const configuration = getResendConfiguration();

  if (!configuration || !isSafeEmailAddress(to)) {
    return false;
  }

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: to.trim(),
      subject,
      html,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}

function textFromRows(intro: string[], rows: Array<[string, string]>, outro: string[]) {
  return [
    ...intro,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    ...outro,
    "",
    organizationName,
  ].join("\n");
}

/**
 * Sent immediately after a customer-portal request is stored (Phase 4
 * brief section 11). Deliberately says this is not yet a confirmation -
 * the Algemene Voorwaarden are clear that a request only becomes binding
 * once Arabisch Nederlands Tolken confirms it, and this email must not
 * contradict that.
 */
export async function sendCustomerRequestReceivedEmail(
  to: string,
  booking: CustomerEmailBooking,
): Promise<boolean> {
  const subject = `Aanvraag ontvangen – ${booking.booking_number}`;
  const rows = bookingDetailRows(booking);

  const html = renderBrandedEmailHtml({
    subject,
    heading: "We hebben uw tolkaanvraag ontvangen",
    bodyParagraphsHtml: [
      "Dit is nog geen definitieve bevestiging van de opdracht. We gaan op zoek naar een geschikte tolk en laten u weten zodra deze definitief is toegewezen.",
    ],
    calloutHtml: renderDetailRowsHtml(rows),
    action: { label: "Bekijk uw aanvraag", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    ["We hebben uw tolkaanvraag ontvangen.", "Dit is nog geen definitieve bevestiging van de opdracht."],
    rows,
    [`Bekijk uw aanvraag: ${portalUrl(booking.id)}`],
  );

  return send(to, subject, html, text);
}

/**
 * Sent when admin has prepared customer-facing terms and moved the
 * booking to status 'quoted' - the moment the customer portal shows an
 * "Opdrachtvoorstel" awaiting Akkoord/Wijziging aanvragen.
 */
export async function sendCustomerActionRequiredEmail(
  to: string,
  booking: CustomerEmailBooking,
): Promise<boolean> {
  const subject = `Opdrachtvoorstel gereed – ${booking.booking_number}`;
  const rows = bookingDetailRows(booking);

  if (booking.customer_price_ex_vat != null) {
    rows.push(["Tarief (excl. btw)", formatNumberAsCurrency(booking.customer_price_ex_vat)]);
  }
  if (booking.customer_travel_fee_ex_vat) {
    rows.push(["Reiskosten (excl. btw)", formatNumberAsCurrency(booking.customer_travel_fee_ex_vat)]);
  }

  const html = renderBrandedEmailHtml({
    subject,
    heading: "Uw opdrachtvoorstel staat klaar",
    bodyParagraphsHtml: [
      "We hebben de gegevens voor uw tolkopdracht klaargezet. Bekijk het voorstel in uw klantportaal en geef aan of u akkoord gaat of een wijziging wilt aanvragen.",
    ],
    calloutHtml: renderDetailRowsHtml(rows),
    action: { label: "Bekijk het opdrachtvoorstel", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    ["Uw opdrachtvoorstel staat klaar.", "Bekijk het voorstel in uw klantportaal en geef uw akkoord of vraag een wijziging aan."],
    rows,
    [`Naar het opdrachtvoorstel: ${portalUrl(booking.id)}`],
  );

  return send(to, subject, html, text);
}

/**
 * The automatic final confirmation triggered once admin finally selects
 * the interpreter (Phase 4 brief section 17) - never sent merely because
 * an interpreter expressed interest.
 */
export async function sendCustomerBookingConfirmedEmail(
  to: string,
  booking: CustomerEmailBooking,
  interpreter: { first_name: string; last_name: string; phone: string | null; rbtv_number: string | null },
  contactName?: string,
): Promise<boolean> {
  const dateLabel = formatDutchDate(booking.requested_date);
  const subject = dateLabel
    ? `Definitieve bevestiging ${modalityWord(booking.modality)} tolk – ${dateLabel}`
    : `Definitieve bevestiging tolkopdracht – ${booking.booking_number}`;

  const rows = bookingDetailRows(booking);
  rows.push(["Tolk", `${interpreter.first_name} ${interpreter.last_name}`]);
  if (interpreter.rbtv_number) {
    rows.push(["Rbtv-nummer", interpreter.rbtv_number]);
  }
  if (booking.customer_price_ex_vat != null) {
    rows.push(["Tarief (excl. btw)", formatNumberAsCurrency(booking.customer_price_ex_vat)]);
  }
  if (booking.customer_overtime_rate_ex_vat) {
    rows.push(["Overurentarief (excl. btw)", formatNumberAsCurrency(booking.customer_overtime_rate_ex_vat)]);
  }

  const callInstruction =
    booking.modality === "telephone" && interpreter.phone
      ? `<p style="margin:8px 0 0;">U kunt de tolk op het afgesproken tijdstip rechtstreeks bellen op <strong>${interpreter.phone}</strong>.</p>`
      : "";

  const greeting = contactName ? `Beste ${contactName},` : null;

  const html = renderBrandedEmailHtml({
    subject,
    heading: "Uw tolkopdracht is definitief bevestigd",
    bodyParagraphsHtml: [
      ...(greeting ? [greeting] : []),
      "De tolk voor uw opdracht is definitief toegewezen. Hieronder vindt u de bevestigde gegevens.",
    ],
    calloutHtml: renderDetailRowsHtml(rows) + callInstruction,
    action: { label: "Bekijk de bevestigde opdracht", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    [...(greeting ? [greeting] : []), "Uw tolkopdracht is definitief bevestigd."],
    rows,
    [
      booking.modality === "telephone" && interpreter.phone
        ? `U kunt de tolk op het afgesproken tijdstip rechtstreeks bellen op het bovenstaande telefoonnummer: ${interpreter.phone}`
        : undefined,
      `Bekijk de opdracht: ${portalUrl(booking.id)}`,
    ].filter((line): line is string => Boolean(line)),
  );

  return send(to, subject, html, text);
}

function modalityWord(modality: string | null) {
  if (modality === "telephone") return "telefonische";
  if (modality === "video") return "video-";
  if (modality === "onsite") return "op locatie";
  return "";
}

export async function sendCustomerReplacementInterpreterEmail(
  to: string,
  booking: CustomerEmailBooking,
  interpreter: { first_name: string; last_name: string; phone: string | null; rbtv_number: string | null },
  contactName?: string,
): Promise<boolean> {
  const subject = `Vervangende tolk bevestigd – ${booking.booking_number}`;
  const rows = bookingDetailRows(booking);
  rows.push(["Vervangende tolk", `${interpreter.first_name} ${interpreter.last_name}`]);
  if (interpreter.rbtv_number) {
    rows.push(["Rbtv-nummer", interpreter.rbtv_number]);
  }

  const callInstruction =
    booking.modality === "telephone" && interpreter.phone
      ? `<p style="margin:8px 0 0;">U kunt de tolk op het afgesproken tijdstip rechtstreeks bellen op <strong>${interpreter.phone}</strong>.</p>`
      : "";

  const greeting = contactName ? `Beste ${contactName},` : null;

  const html = renderBrandedEmailHtml({
    subject,
    heading: "Voor uw opdracht is een vervangende tolk bevestigd",
    bodyParagraphsHtml: [
      ...(greeting ? [greeting] : []),
      "De eerder toegewezen tolk voor uw opdracht bleek verhinderd. We hebben een vervangende tolk geregeld die aan dezelfde eisen voldoet als voor uw opdracht overeengekomen, inclusief taalcombinatie en - indien van toepassing - beëdiging/Rbtv-registratie.",
    ],
    calloutHtml: renderDetailRowsHtml(rows) + callInstruction,
    action: { label: "Bekijk de opdracht", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    [
      ...(greeting ? [greeting] : []),
      "Voor uw opdracht is een vervangende tolk bevestigd.",
      "De vervangende tolk voldoet aan dezelfde eisen als eerder overeengekomen.",
    ],
    rows,
    [`Bekijk de opdracht: ${portalUrl(booking.id)}`],
  );

  return send(to, subject, html, text);
}

export async function sendCustomerCancellationRequestReceivedEmail(
  to: string,
  booking: CustomerEmailBooking,
): Promise<boolean> {
  const subject = `Annuleringsverzoek ontvangen – ${booking.booking_number}`;

  const html = renderBrandedEmailHtml({
    subject,
    heading: "We hebben uw annuleringsverzoek ontvangen",
    bodyParagraphsHtml: [
      "We beoordelen uw verzoek en nemen zo nodig contact met u op. Dit is nog geen financiële afwikkeling - eventuele annuleringskosten worden, indien van toepassing, apart met u besproken.",
    ],
    calloutHtml: renderDetailRowsHtml([["Boekingnummer", booking.booking_number]]),
    action: { label: "Bekijk de opdracht", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    ["We hebben uw annuleringsverzoek ontvangen.", "We beoordelen uw verzoek en nemen zo nodig contact met u op."],
    [["Boekingnummer", booking.booking_number]],
    [`Bekijk de opdracht: ${portalUrl(booking.id)}`],
  );

  return send(to, subject, html, text);
}

export async function sendCustomerCancellationApprovedEmail(
  to: string,
  booking: CustomerEmailBooking,
): Promise<boolean> {
  const subject = `Opdracht geannuleerd – ${booking.booking_number}`;

  const html = renderBrandedEmailHtml({
    subject,
    heading: "Uw tolkopdracht is geannuleerd",
    bodyParagraphsHtml: [
      "Uw annuleringsverzoek is beoordeeld en de opdracht is geannuleerd. Eventuele afspraken over annuleringskosten vindt u, indien van toepassing, in uw klantportaal of ontvangt u apart van ons.",
    ],
    calloutHtml: renderDetailRowsHtml([["Boekingnummer", booking.booking_number]]),
    action: { label: "Bekijk de opdracht", href: portalUrl(booking.id) },
  });

  const text = textFromRows(
    ["Uw tolkopdracht is geannuleerd."],
    [["Boekingnummer", booking.booking_number]],
    [`Bekijk de opdracht: ${portalUrl(booking.id)}`],
  );

  return send(to, subject, html, text);
}

/** Best-effort admin alert for a fresh customer-portal request - optional per the brief, never blocks or reverts the booking on failure. */
export async function adminNotifyNewCustomerPortalRequest(
  booking: { id: string; booking_number: string },
  customerLabel: string,
): Promise<boolean> {
  const configuration = getResendConfiguration();

  if (!configuration || !configuration.adminTo) {
    return false;
  }

  const subject = `[Klantportaal] Nieuwe aanvraag ${booking.booking_number} · ${customerLabel}`;
  const text = [
    `Nieuwe tolkaanvraag via het klantportaal van ${customerLabel}.`,
    `Beheer deze aanvraag: ${absoluteUrl(`/admin/bookings/${booking.id}`)}`,
  ].join("\n");

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: configuration.adminTo,
      subject,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}
