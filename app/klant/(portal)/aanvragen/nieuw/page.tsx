import { createClient } from "@/lib/supabase/server";
import { requireCustomerLayoutSession } from "@/lib/auth/customer";
import { getMyCustomerBooking } from "@/lib/customers/portal-queries";
import {
  CustomerRequestForm,
  type CustomerRequestDefaults,
} from "@/app/klant/(portal)/aanvragen/nieuw/request-form";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function NewCustomerRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ repeatFrom?: string }>;
}) {
  const session = await requireCustomerLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const { repeatFrom } = await searchParams;
  const supabase = await createClient();

  let defaults: CustomerRequestDefaults = {
    languageFrom: session.customer.default_language_from ?? "ar",
    languageTo: session.customer.default_language_to ?? "nl",
    languageNotes: session.customer.default_language_notes ?? "",
    context: session.customer.default_context ?? "healthcare",
    modality: session.customer.default_modality ?? "",
    swornRequired: session.customer.default_sworn_required ?? false,
    expectedDurationMinutes: session.customer.default_duration_minutes?.toString() ?? "",
    locationName: session.customer.default_location_name ?? "",
    locationAddress: session.customer.default_location_address ?? "",
  };

  let repeatedFromBookingId: string | null = null;
  let repeatedFromBookingNumber: string | null = null;

  // "Opnieuw boeken" (Phase 4 brief section 8): prefill operational
  // defaults from a previous booking, never its status, interpreter,
  // price, or notes - the form below only ever submits the fields a
  // customer can actually see and edit here, so nothing sensitive can
  // leak through this prefill even in principle.
  if (repeatFrom && UUID_PATTERN.test(repeatFrom)) {
    const previous = await getMyCustomerBooking(supabase, repeatFrom);

    if (previous) {
      repeatedFromBookingId = previous.booking_id;
      repeatedFromBookingNumber = previous.booking_number;
      defaults = {
        languageFrom: previous.language_from,
        languageTo: previous.language_to,
        languageNotes: previous.language_notes ?? "",
        context: previous.context,
        modality: previous.modality ?? "",
        swornRequired: previous.sworn_required,
        expectedDurationMinutes: previous.expected_duration_minutes?.toString() ?? "",
        locationName: previous.location_name ?? "",
        locationAddress: previous.location_address ?? "",
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Klantportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Nieuwe tolkaanvraag
        </h1>
        {repeatedFromBookingNumber ? (
          <p className="mt-2 text-sm leading-6 text-muted">
            Vooraf ingevuld op basis van opdracht {repeatedFromBookingNumber}. Dit
            wordt een nieuwe, aparte aanvraag - pas gerust datum, tijd en duur aan.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-muted">
            Vul de gegevens hieronder in. Dit is nog geen definitieve
            bevestiging - we laten u weten zodra een tolk definitief is
            toegewezen.
          </p>
        )}
      </div>

      <div className="panel px-6 py-6">
        <CustomerRequestForm repeatedFromBookingId={repeatedFromBookingId} defaults={defaults} />
      </div>
    </div>
  );
}
