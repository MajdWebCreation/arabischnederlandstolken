import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { InterpreterLanguageRow, InterpreterRow } from "@/lib/interpreters/queries";

type TypedClient = SupabaseClient<Database>;

export type CapabilityTagRow =
  Database["public"]["Tables"]["capability_tags"]["Row"];

export type InterpreterCapabilityRow =
  Database["public"]["Tables"]["interpreter_capabilities"]["Row"] & {
    capability_tags: CapabilityTagRow | null;
  };

export type InterpreterForMatching = InterpreterRow & {
  interpreter_languages: InterpreterLanguageRow[];
  interpreter_capabilities: InterpreterCapabilityRow[];
};

export async function listInterpretersForMatching(
  supabase: TypedClient,
): Promise<InterpreterForMatching[]> {
  const { data, error } = await supabase
    .from("interpreters")
    .select(
      "*, interpreter_languages(*), interpreter_capabilities(*, capability_tags(*))",
    )
    .order("last_name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as InterpreterForMatching[];
}

export async function listCapabilityTags(
  supabase: TypedClient,
): Promise<CapabilityTagRow[]> {
  const { data, error } = await supabase
    .from("capability_tags")
    .select("*")
    .order("category", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getInterpreterCapabilities(
  supabase: TypedClient,
  interpreterId: string,
): Promise<InterpreterCapabilityRow[]> {
  const { data, error } = await supabase
    .from("interpreter_capabilities")
    .select("*, capability_tags(*)")
    .eq("interpreter_id", interpreterId);

  if (error) {
    throw error;
  }

  return (data ?? []) as InterpreterCapabilityRow[];
}

/** The minimal booking shape matching needs - avoids importing the full admin BookingDetail type into a module that has no other reason to depend on it. */
export type MatchableBooking = {
  language_from: string;
  language_to: string;
  sworn_required: boolean;
  context: string;
  required_dialect_tag_id: string | null;
};

export type MatchReason = {
  key: "language" | "sworn" | "dialect" | "specialty";
  label: string;
  met: boolean;
  /** If true and not met, the interpreter is excluded from "eligible". Language and sworn/Rbtv validity are the only hard gates - see the module comment. */
  hardGate: boolean;
};

export type InterpreterMatch = {
  interpreter: InterpreterForMatching;
  eligible: boolean;
  reasons: MatchReason[];
};

function isRbtvValid(interpreter: InterpreterForMatching) {
  if (!interpreter.sworn_interpreter) return false;
  if (!interpreter.rbtv_number) return false;
  if (!interpreter.rbtv_expiry_date) return false;
  return new Date(interpreter.rbtv_expiry_date) >= new Date(new Date().toDateString());
}

function hasLanguagePair(
  interpreter: InterpreterForMatching,
  languageFrom: string,
  languageTo: string,
) {
  return interpreter.interpreter_languages.some(
    (combo) =>
      (combo.language_from === languageFrom && combo.language_to === languageTo) ||
      (combo.language_from === languageTo && combo.language_to === languageFrom),
  );
}

const SPECIALTY_CODE_BY_CONTEXT: Record<string, string> = {
  healthcare: "healthcare",
  legal: "legal",
  municipality: "municipality",
  migration: "migration",
  business: "business",
};

/**
 * Eligibility, computed transparently rather than scored: only language
 * pair and (when required) sworn/Rbtv validity are hard gates, directly
 * matching the brief's one explicit hard rule ("should not normally be
 * presented as eligible when sworn status is false, Rbtv information is
 * missing, or Rbtv registration is expired"). Dialect and specialty are
 * shown as additional informational checks admin can weigh themselves -
 * the brief's own example UI shows a non-sworn interpreter for a sworn
 * booking as flatly "Not eligible", but shows dialect/specialty as plain
 * checkmarks alongside hard criteria, never as a second exclusion rule.
 */
export function matchInterpreters(
  booking: MatchableBooking,
  interpreters: InterpreterForMatching[],
  dialectTag: CapabilityTagRow | null,
): InterpreterMatch[] {
  const requiredSpecialtyCode = SPECIALTY_CODE_BY_CONTEXT[booking.context];

  return interpreters
    .filter((interpreter) => interpreter.active)
    .map((interpreter) => {
      const languageOk = hasLanguagePair(
        interpreter,
        booking.language_from,
        booking.language_to,
      );

      const reasons: MatchReason[] = [
        {
          key: "language",
          label: `${booking.language_from.toUpperCase()} ↔ ${booking.language_to.toUpperCase()}`,
          met: languageOk,
          hardGate: true,
        },
      ];

      if (booking.sworn_required) {
        reasons.push({
          key: "sworn",
          label: "Beëdigd + geldige Rbtv-registratie",
          met: isRbtvValid(interpreter),
          hardGate: true,
        });
      }

      if (dialectTag) {
        const hasDialect = interpreter.interpreter_capabilities.some(
          (cap) => cap.capability_tag_id === dialectTag.id,
        );
        reasons.push({
          key: "dialect",
          label: dialectTag.label,
          met: hasDialect,
          hardGate: false,
        });
      }

      if (requiredSpecialtyCode) {
        const hasSpecialty = interpreter.interpreter_capabilities.some(
          (cap) =>
            cap.capability_tags?.category === "specialty" &&
            cap.capability_tags.code === requiredSpecialtyCode,
        );
        reasons.push({
          key: "specialty",
          label:
            interpreter.interpreter_capabilities.find(
              (cap) =>
                cap.capability_tags?.category === "specialty" &&
                cap.capability_tags.code === requiredSpecialtyCode,
            )?.capability_tags?.label ?? "Relevante specialisatie",
          met: hasSpecialty,
          hardGate: false,
        });
      }

      const eligible = reasons.every((reason) => !reason.hardGate || reason.met);

      return { interpreter, eligible, reasons };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return a.interpreter.last_name.localeCompare(b.interpreter.last_name);
    });
}

export type SchedulingConflict = {
  bookingId: string;
  bookingNumber: string;
  requestedDate: string;
  requestedStartTime: string;
};

/**
 * Advisory only, deliberately - the brief asks for a warning, not a hard
 * block ("do not over-engineer a full scheduling calendar yet"). Two
 * bookings conflict when they're the same interpreter, same date, and their
 * [start, start+duration) windows overlap; a booking with no duration on
 * file is treated as a conservative 60-minute placeholder so a same-time
 * double-booking is still caught even before duration is known.
 */
export async function findSchedulingConflicts(
  supabase: TypedClient,
  params: {
    interpreterId: string;
    requestedDate: string;
    requestedStartTime: string;
    expectedDurationMinutes: number | null;
    excludeBookingId?: string;
  },
): Promise<SchedulingConflict[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_number, requested_date, requested_start_time, expected_duration_minutes")
    .eq("interpreter_id", params.interpreterId)
    .eq("requested_date", params.requestedDate)
    .in("status", ["interpreter_confirmed", "confirmed"])
    .not("requested_start_time", "is", null);

  if (error) {
    throw error;
  }

  const targetStart = toMinutes(params.requestedStartTime);
  const targetEnd = targetStart + (params.expectedDurationMinutes ?? 60);

  return (data ?? [])
    .filter((row) => row.id !== params.excludeBookingId && row.requested_start_time)
    .filter((row) => {
      const otherStart = toMinutes(row.requested_start_time as string);
      const otherEnd = otherStart + (row.expected_duration_minutes ?? 60);
      return targetStart < otherEnd && otherStart < targetEnd;
    })
    .map((row) => ({
      bookingId: row.id,
      bookingNumber: row.booking_number,
      requestedDate: row.requested_date as string,
      requestedStartTime: row.requested_start_time as string,
    }));
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
