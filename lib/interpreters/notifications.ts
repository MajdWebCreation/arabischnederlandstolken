import "server-only";

import { Resend } from "resend";
import { absoluteUrl, organizationName } from "@/lib/site";

// Reuses the same Resend project/API key the public contact form already
// uses (RESEND_API_KEY) - no new secret to configure. Deliberately its own
// small client cache rather than importing lib/contact/email.ts, which is
// scoped to the public contact flow and not a natural place to grow
// interpreter-portal concerns.
let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

function isSafeConfigurationValue(value: string | undefined) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;

  if (!isSafeConfigurationValue(apiKey) || !isSafeConfigurationValue(from)) {
    return null;
  }

  return { apiKey: apiKey!.trim(), from: from!.trim() };
}

/**
 * Every interpreter notification deliberately says as little as possible
 * about the assignment itself - no date, no location, no compensation, not
 * even which booking. The database is authoritative; email only tells the
 * interpreter that something changed and where to look. This also means a
 * failed or delayed send can never leave stale or incorrect details
 * sitting in an inbox.
 */
async function sendPortalNotification(
  to: string,
  subject: string,
  bodyLine: string,
  portalPath = "/tolk",
): Promise<boolean> {
  const configuration = getEmailConfiguration();

  if (!configuration || !isSafeConfigurationValue(to)) {
    return false;
  }

  const portalUrl = absoluteUrl(portalPath);
  const text = [
    bodyLine,
    "",
    `Log in om de details te bekijken: ${portalUrl}`,
    "",
    organizationName,
  ].join("\n");

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: to.trim(),
      subject,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function sendAssignmentInvitationEmail(interpreterEmail: string) {
  return sendPortalNotification(
    interpreterEmail,
    "Nieuwe opdracht beschikbaar",
    "Er is een nieuwe tolkopdracht voor u beschikbaar.",
  );
}

/**
 * "Vraag tolk profiel af te ronden" (brief section 3) - sent from the
 * settlement-readiness blocker on the booking/interpreter-invoice admin
 * pages when a completed booking's settlement cannot be submitted because
 * the interpreter's business/payment/fiscal/self-billing setup is
 * incomplete. Says nothing about the specific booking or amounts, matching
 * every other portal notification here.
 */
export async function sendProfileCompletionReminderEmail(interpreterEmail: string) {
  return sendPortalNotification(
    interpreterEmail,
    "Rond uw tolkprofiel af",
    "Om afrekeningen en uitbetalingen te kunnen verwerken, vragen wij u uw zakelijke, fiscale en betaalgegevens aan te vullen.",
    "/tolk/profiel",
  );
}

export async function sendAssignmentSelectedEmail(interpreterEmail: string) {
  return sendPortalNotification(
    interpreterEmail,
    "Opdracht bevestigd",
    "Een opdracht waarop u heeft gereageerd is definitief aan u toegewezen.",
  );
}

export async function sendAssignmentWithdrawnEmail(interpreterEmail: string) {
  return sendPortalNotification(
    interpreterEmail,
    "Uitnodiging ingetrokken",
    "Een openstaande opdrachtuitnodiging is door de beheerder ingetrokken.",
  );
}

export async function sendInterpreterBookingCancelledEmail(interpreterEmail: string) {
  return sendPortalNotification(
    interpreterEmail,
    "Opdracht geannuleerd",
    "Een eerder aan u bevestigde opdracht is door de klant/beheerder geannuleerd.",
  );
}

/**
 * Urgent admin alert when an interpreter reports they can no longer
 * perform a confirmed assignment (Phase 4 brief section 27). Deliberately
 * says nothing to the customer at this point - the brief is explicit that
 * a premature customer email risks alarming them before a replacement can
 * even be attempted; admin controls the customer-facing outcome
 * separately once a replacement is found or the booking must be cancelled.
 */
export async function sendInterpreterUnavailabilityAdminAlert(
  bookingNumber: string,
  bookingId: string,
) {
  const configuration = getEmailConfiguration();

  if (!configuration) {
    return false;
  }

  const adminTo = process.env.CONTACT_FORM_TO_EMAIL;
  if (!isSafeConfigurationValue(adminTo)) {
    return false;
  }

  const text = [
    `Een tolk heeft zich verhinderd gemeld voor een bevestigde opdracht: ${bookingNumber}.`,
    "De opdracht van de klant blijft intact - zoek zo snel mogelijk een vervangende tolk.",
    "",
    `Beheer deze opdracht: ${absoluteUrl(`/admin/bookings/${bookingId}`)}`,
  ].join("\n");

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: adminTo!.trim(),
      subject: `[Actie vereist] Tolk verhinderd – ${bookingNumber}`,
      text,
    });

    return !error;
  } catch {
    return false;
  }
}
