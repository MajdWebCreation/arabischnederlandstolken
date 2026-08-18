/**
 * The Algemene Voorwaarden version currently in effect. Kept as a single
 * constant so every place that stamps or displays it (terms acceptance at
 * booking-offer acceptance, the /klant portal) agrees. The public terms
 * page itself (lib/site-content.ts, "Versie 2026-08") is untouched Phase
 * 1-3 content and keeps its own copy of this string in its display label -
 * update both together if the terms are ever revised.
 */
export const CURRENT_TERMS_VERSION = "2026-08";
export const TERMS_PATH = "/nl/algemene-voorwaarden";

/**
 * The cancellation terms/reference snapshotted onto a booking at the
 * moment of customer acceptance (customer_accept_booking_offer()) - a
 * short pointer to which articles govern cancellation for this booking,
 * not a fee schedule (the actual cancellation tariff/staffel is not yet
 * finalised - see article 13). Lives here, not in the database migration,
 * for the same reason CURRENT_TERMS_VERSION does: the legal wording is an
 * application-layer concern (see lib/site-content.ts for the full text),
 * so a future revision is an app deploy, not a migration. Update this
 * together with CURRENT_TERMS_VERSION whenever the terms are revised.
 */
export const CANCELLATION_TERMS_REFERENCE =
  `Algemene Voorwaarden Arabisch Nederlands Tolken, versie ${CURRENT_TERMS_VERSION}, artikel 13 (annulering door de klant), artikel 14-15 (annulering/uitval en vervanging van de tolk) en, uitsluitend voor consumenten, artikel 17-18 (herroepingsrecht en start van dienstverlening binnen de bedenktijd).`;
