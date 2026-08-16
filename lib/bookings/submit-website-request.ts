import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ContactFormData } from "@/lib/contact/schema";
import type { Locale } from "@/lib/site";

export type WebsiteBookingSubmissionResult =
  | { ok: true; bookingId: string; bookingNumber: string }
  | { ok: false; error: string };

// The public form still collects "delivery mode" / "language direction" in
// the shape the existing site already uses; these map onto the booking
// schema's modality / language_from+language_to columns.
const deliveryModeToModality: Record<string, "telephone" | "video" | "onsite" | null> = {
  phone: "telephone",
  video: "video",
  on_location: "onsite",
  unknown: null,
};

const languageDirectionToPair: Record<string, { from: string; to: string }> = {
  ar_to_nl: { from: "ar", to: "nl" },
  nl_to_ar: { from: "nl", to: "ar" },
  both_or_unknown: { from: "ar", to: "nl" },
};

const languageNotesByLocale: Record<Locale, string> = {
  nl: "Taalrichting door klant niet gespecificeerd (beide/onbekend).",
  ar: "لم يحدد العميل اتجاه اللغة (كلاهما/غير معروف).",
};

const desiredDateTimeLabelByLocale: Record<Locale, string> = {
  nl: "Gewenste datum/tijd (vrije tekst van klant)",
  ar: "التاريخ/الوقت المطلوب (كما كتبه العميل)",
};

/**
 * The existing form only collects a free-text "desired date/time" string,
 * not a structured date+time. Parsing that into bookings.requested_date /
 * requested_start_time automatically would risk silently misreading it
 * (locale-ambiguous formats, relative phrases like "next Thursday"), so it
 * deliberately stays out of those structured columns - admin fills those in
 * once the exact date/time is confirmed with the customer. The raw text is
 * preserved by folding it into customer_message (so it's visible directly
 * on the booking detail page) and separately into the booking_created
 * event's metadata (for the audit trail).
 */
function buildCustomerMessage(
  desiredDateTime: string | undefined,
  message: string,
  locale: Locale,
) {
  const trimmedHint = desiredDateTime?.trim();

  if (!trimmedHint) {
    return message;
  }

  return `${desiredDateTimeLabelByLocale[locale]}: ${trimmedHint}\n\n${message}`;
}

export async function submitWebsiteBookingRequest(
  data: ContactFormData,
  locale: Locale,
): Promise<WebsiteBookingSubmissionResult> {
  const supabase = await createClient();
  const languagePair = languageDirectionToPair[data.languageDirection];

  const { data: rows, error } = await supabase.rpc(
    "submit_website_booking_request",
    {
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone ?? null,
      p_organisation: data.organization ?? null,
      p_request_type: data.requestType,
      p_context: data.context,
      p_language_from: languagePair.from,
      p_language_to: languagePair.to,
      p_language_notes:
        data.languageDirection === "both_or_unknown"
          ? languageNotesByLocale[locale]
          : null,
      p_modality: data.deliveryMode
        ? deliveryModeToModality[data.deliveryMode]
        : null,
      p_desired_date_time_text: data.desiredDateTime ?? null,
      p_message: buildCustomerMessage(data.desiredDateTime, data.message, locale),
      p_form_language: locale,
    },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  const row = rows?.[0];

  if (!row) {
    return { ok: false, error: "no_booking_returned" };
  }

  return {
    ok: true,
    bookingId: row.booking_id,
    bookingNumber: row.booking_number,
  };
}
