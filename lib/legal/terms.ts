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
