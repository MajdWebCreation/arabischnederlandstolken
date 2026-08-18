import { z } from "zod";
import { parseMoneyInputToCents } from "@/lib/money";
import { BOOKING_MODALITIES, BOOKING_STATUSES } from "@/lib/bookings/constants";

/**
 * Validates a money form field and converts it straight to integer cents
 * (or null for "not set"). Kept as a single reusable piece so every
 * financial form field is parsed identically.
 */
const moneyField = z.string().transform((raw, ctx) => {
  const cents = parseMoneyInputToCents(raw);

  if (cents === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Vul een geldig bedrag in (bijvoorbeeld 110 of 110,50).",
    });
    return z.NEVER;
  }

  return cents;
});

export const bookingFinancialsSchema = z.object({
  customerPriceExVat: moneyField,
  interpreterCostExVat: moneyField,
  customerTravelFeeExVat: moneyField,
  interpreterTravelCostExVat: moneyField,
  customerOvertimeRateExVat: moneyField,
  interpreterOvertimeRateExVat: moneyField,
  vatRate: z
    .string()
    .trim()
    .regex(/^\d{1,3}([.,]\d{1,2})?$/, "Vul een geldig btw-percentage in.")
    .transform((raw) => Number(raw.replace(",", ".")))
    .refine((value) => value >= 0 && value <= 100, {
      message: "Het btw-percentage moet tussen 0 en 100 liggen.",
    }),
});

export type BookingFinancialsInput = z.infer<typeof bookingFinancialsSchema>;

export const bookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES, { error: "Kies een geldige status." }),
});

export const bookingInterpreterAssignmentSchema = z.object({
  interpreterId: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[0-9a-f-]{36}$/i.test(value), {
      message: "Ongeldige tolk.",
    }),
});

export const bookingInternalNotesSchema = z.object({
  internalNotes: z.string().trim().max(4000, "Maximaal 4000 tekens."),
});

const optionalTrimmed = (max: number, message: string) =>
  z.string().trim().max(max, message);

export const bookingDetailsSchema = z.object({
  requestedDate: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Vul een geldige datum in.",
    }),
  requestedStartTime: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{2}:\d{2}$/.test(value), {
      message: "Vul een geldige tijd in.",
    }),
  expectedDurationMinutes: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,4}$/.test(value), {
      message: "Vul de duur in minuten in.",
    }),
  actualDurationMinutes: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,4}$/.test(value), {
      message: "Vul de duur in minuten in.",
    }),
  locationName: optionalTrimmed(200, "Maximaal 200 tekens."),
  locationAddress: optionalTrimmed(300, "Maximaal 300 tekens."),
  languageNotes: optionalTrimmed(500, "Maximaal 500 tekens."),
  modality: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (BOOKING_MODALITIES as readonly string[]).includes(value),
      { message: "Kies een geldige inzetvorm." },
    ),
  requiredDialectTagId: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[0-9a-f-]{36}$/i.test(value), {
      message: "Ongeldig dialect.",
    }),
  onsiteContactName: optionalTrimmed(160, "Maximaal 160 tekens."),
  onsiteContactPhone: optionalTrimmed(40, "Maximaal 40 tekens."),
  interpreterBrief: optionalTrimmed(2000, "Maximaal 2000 tekens."),
  // swornRequired is a checkbox: read directly with formCheckbox() in the
  // action rather than validated here, since unchecked checkboxes are
  // simply absent from FormData rather than present with an empty value.
});
