import { z } from "zod";
import { BOOKING_CONTEXTS, BOOKING_MODALITIES } from "@/lib/bookings/constants";

export const customerSchema = z.object({
  type: z.enum(["individual", "business"], { error: "Kies een geldig type." }),
  name: z.string().trim().min(1, "Vul een naam in.").max(160, "Maximaal 160 tekens."),
  organisation: z.string().trim().max(160, "Maximaal 160 tekens."),
  email: z
    .string()
    .trim()
    .min(1, "Vul een e-mailadres in.")
    .max(254, "Het e-mailadres is te lang.")
    .email("Vul een geldig e-mailadres in."),
  phone: z.string().trim().max(40, "Maximaal 40 tekens."),
  billingName: z.string().trim().max(160, "Maximaal 160 tekens."),
  billingEmail: z
    .string()
    .trim()
    .max(254, "Het e-mailadres is te lang.")
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Vul een geldig e-mailadres in.",
    }),
  billingStreet: z.string().trim().max(160, "Maximaal 160 tekens."),
  billingHouseNumber: z.string().trim().max(20, "Maximaal 20 tekens."),
  billingHouseNumberAddition: z.string().trim().max(20, "Maximaal 20 tekens."),
  billingPostalCode: z.string().trim().max(20, "Maximaal 20 tekens."),
  billingCity: z.string().trim().max(80, "Maximaal 80 tekens."),
  kvkNumber: z.string().trim().max(40, "Maximaal 40 tekens."),
  vatNumber: z.string().trim().max(40, "Maximaal 40 tekens."),
  internalNotes: z.string().trim().max(4000, "Maximaal 4000 tekens."),
});

/**
 * Admin-managed booking defaults (Phase 4 brief section 31), used only to
 * prefill a customer's own new-request form in the portal - never binding,
 * always overridable per request. Deliberately a lightweight set of plain
 * fields, not a tariff/template system.
 */
export const customerBookingDefaultsSchema = z.object({
  defaultLanguageFrom: z.string().trim().max(20, "Ongeldige taal."),
  defaultLanguageTo: z.string().trim().max(20, "Ongeldige taal."),
  defaultLanguageNotes: z.string().trim().max(500, "Maximaal 500 tekens."),
  defaultContext: z
    .string()
    .trim()
    .refine((value) => value === "" || (BOOKING_CONTEXTS as readonly string[]).includes(value), {
      message: "Kies een geldige context.",
    }),
  defaultModality: z
    .string()
    .trim()
    .refine((value) => value === "" || (BOOKING_MODALITIES as readonly string[]).includes(value), {
      message: "Kies een geldige inzetvorm.",
    }),
  defaultDurationMinutes: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,4}$/.test(value), {
      message: "Vul de duur in minuten in.",
    }),
  defaultLocationName: z.string().trim().max(200, "Maximaal 200 tekens."),
  defaultLocationAddress: z.string().trim().max(300, "Maximaal 300 tekens."),
});
