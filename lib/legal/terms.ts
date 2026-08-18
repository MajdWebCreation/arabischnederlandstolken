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

/**
 * The self-billing consent version stamped by
 * interpreter_accept_self_billing_agreement(). Deliberately a separate
 * version track from CURRENT_TERMS_VERSION - this is a distinct agreement
 * (the interpreter consenting to be paid via invoices Arabisch Nederlands
 * Tolken raises on their behalf) from the customer-facing Algemene
 * Voorwaarden, with its own text and its own revision timeline. The exact
 * legal wording of this agreement has not been drafted/reviewed yet -
 * SELF_BILLING_AGREEMENT_SUMMARY is a short, functional consent statement
 * only, not a substitute for that. See the Phase 4 interpreter-onboarding
 * report for this caveat.
 */
export const CURRENT_SELF_BILLING_TERMS_VERSION = "2026-08";
export const SELF_BILLING_AGREEMENT_SUMMARY =
  "Ik ga ermee akkoord dat Arabisch Nederlands Tolken namens mij facturen opstelt (self-billing) voor de tolkdiensten die ik verricht, op basis van de bedrijfs- en betaalgegevens die ik zelf heb opgegeven.";
