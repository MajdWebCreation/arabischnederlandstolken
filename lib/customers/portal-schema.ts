import { z } from "zod";
import { BOOKING_CONTEXTS, BOOKING_MODALITIES } from "@/lib/bookings/constants";

const optionalTrimmed = (max: number, message: string) =>
  z.string().trim().max(max, message);

/**
 * The authenticated customer-portal request form (Phase 4 brief section
 * 7), reusing the exact same context/modality value sets the public
 * contact form and admin booking-details form already validate against
 * (lib/bookings/constants.ts) - never a parallel set of options. Deliberately
 * asks for less free text than the admin-side form: no internal_notes,
 * no interpreter_brief, no dialect tag picker - a customer only ever
 * supplies the same fields the public website form already collects, plus
 * scheduling, which the public form leaves to a follow-up phone call.
 */
export const customerBookingRequestSchema = z.object({
  languageFrom: z.string().trim().min(1, "Kies een taal.").max(20, "Ongeldige taal."),
  languageTo: z.string().trim().min(1, "Kies een taal.").max(20, "Ongeldige taal."),
  languageNotes: optionalTrimmed(500, "Maximaal 500 tekens."),
  context: z.enum(BOOKING_CONTEXTS, { error: "Kies een geldige context." }),
  modality: z.enum(BOOKING_MODALITIES, { error: "Kies een geldige inzetvorm." }),
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
      message: "Vul de verwachte duur in minuten in.",
    }),
  locationName: optionalTrimmed(200, "Maximaal 200 tekens."),
  locationAddress: optionalTrimmed(300, "Maximaal 300 tekens."),
  customerMessage: optionalTrimmed(2000, "Maximaal 2000 tekens."),
  // swornRequired is a checkbox, read directly with formCheckbox() in the
  // action rather than validated here - see bookingDetailsSchema for the
  // same convention.
});

export type CustomerBookingRequestInput = z.infer<typeof customerBookingRequestSchema>;

/** Safe, customer-editable fields only (Phase 4 brief section 22) - see enforce_customer_self_edit_columns() for the database-level backstop. */
export const customerProfileSchema = z.object({
  name: z.string().trim().min(1, "Vul een naam in.").max(160, "Maximaal 160 tekens."),
  phone: optionalTrimmed(40, "Maximaal 40 tekens."),
  billingName: optionalTrimmed(160, "Maximaal 160 tekens."),
  billingEmail: z
    .string()
    .trim()
    .max(254, "Het e-mailadres is te lang.")
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Vul een geldig e-mailadres in.",
    }),
  billingStreet: optionalTrimmed(160, "Maximaal 160 tekens."),
  billingHouseNumber: optionalTrimmed(20, "Maximaal 20 tekens."),
  billingHouseNumberAddition: optionalTrimmed(20, "Maximaal 20 tekens."),
  billingPostalCode: optionalTrimmed(20, "Maximaal 20 tekens."),
  billingCity: optionalTrimmed(80, "Maximaal 80 tekens."),
});

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;

export const cancellationReasonSchema = z.object({
  reason: optionalTrimmed(1000, "Maximaal 1000 tekens."),
});

export const offerChangeRequestSchema = z.object({
  message: z.string().trim().min(1, "Beschrijf kort welke wijziging u wilt.").max(1000, "Maximaal 1000 tekens."),
});

/**
 * Password change for the currently authenticated portal user only - see
 * changeMyPassword() in actions.ts, which calls Supabase Auth's own
 * updateUser() and never touches any public table. No "current password"
 * field: the brief's own field list is exactly these two, and Supabase
 * Auth already requires a valid, currently-authenticated session before
 * this can be called at all.
 */
export const customerPasswordChangeSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Wachtwoord moet minimaal 8 tekens bevatten.")
      .max(72, "Wachtwoord mag maximaal 72 tekens bevatten."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "De wachtwoorden komen niet overeen.",
    path: ["confirmPassword"],
  });

export type CustomerPasswordChangeInput = z.infer<typeof customerPasswordChangeSchema>;
