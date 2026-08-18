import { z } from "zod";
import { INTERPRETER_VAT_TREATMENTS } from "@/lib/interpreters/constants";

export const interpreterSchema = z.object({
  firstName: z.string().trim().min(1, "Vul een voornaam in.").max(80, "Maximaal 80 tekens."),
  lastName: z.string().trim().min(1, "Vul een achternaam in.").max(80, "Maximaal 80 tekens."),
  email: z
    .string()
    .trim()
    .min(1, "Vul een e-mailadres in.")
    .max(254, "Het e-mailadres is te lang.")
    .email("Vul een geldig e-mailadres in."),
  phone: z.string().trim().max(40, "Maximaal 40 tekens."),
  city: z.string().trim().max(120, "Maximaal 120 tekens."),
  rbtvNumber: z.string().trim().max(60, "Maximaal 60 tekens."),
  rbtvExpiryDate: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Vul een geldige datum in.",
    }),
  internalNotes: z.string().trim().max(4000, "Maximaal 4000 tekens."),
  // active / swornInterpreter are checkboxes, read with formCheckbox().
});

export type InterpreterInput = z.infer<typeof interpreterSchema>;

const optionalTrimmed = (max: number, message: string) => z.string().trim().max(max, message);

/** Self-editable by the interpreter (section C of the onboarding brief) - see enforce_interpreter_self_edit_columns() for the database-level backstop. Every field optional: the point of onboarding is gradual completion, not a single all-or-nothing form. */
export const interpreterBusinessDetailsSchema = z.object({
  legalBusinessName: optionalTrimmed(160, "Maximaal 160 tekens."),
  tradeName: optionalTrimmed(160, "Maximaal 160 tekens."),
  businessStreet: optionalTrimmed(160, "Maximaal 160 tekens."),
  businessHouseNumber: optionalTrimmed(20, "Maximaal 20 tekens."),
  businessHouseNumberAddition: optionalTrimmed(20, "Maximaal 20 tekens."),
  businessPostalCode: optionalTrimmed(20, "Maximaal 20 tekens."),
  businessCity: optionalTrimmed(80, "Maximaal 80 tekens."),
  kvkNumber: optionalTrimmed(40, "Maximaal 40 tekens."),
  vatId: optionalTrimmed(40, "Maximaal 40 tekens."),
});

export type InterpreterBusinessDetailsInput = z.infer<typeof interpreterBusinessDetailsSchema>;

/** Self-editable by the interpreter (section D). IBAN format is checked here (defense in depth alongside the database's own CHECK constraint) but left blank is valid - not yet provided, not invalid. */
export const interpreterPaymentDetailsSchema = z.object({
  iban: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, "").toUpperCase())
    .refine((value) => value === "" || /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(value), {
      message: "Vul een geldig IBAN in.",
    }),
  accountHolderName: optionalTrimmed(160, "Maximaal 160 tekens."),
});

export type InterpreterPaymentDetailsInput = z.infer<typeof interpreterPaymentDetailsSchema>;

/** Self-editable by the interpreter (section E) - self-declared, never inferred by the application. */
export const interpreterFiscalDetailsSchema = z.object({
  vatTreatment: z
    .string()
    .trim()
    .refine((value) => value === "" || (INTERPRETER_VAT_TREATMENTS as readonly string[]).includes(value), {
      message: "Kies een geldige btw-status.",
    }),
});

export type InterpreterFiscalDetailsInput = z.infer<typeof interpreterFiscalDetailsSchema>;

export const interpreterLanguageSchema = z.object({
  languageFrom: z
    .string()
    .trim()
    .min(1, "Verplicht.")
    .max(40, "Maximaal 40 tekens.")
    .transform((value) => value.toLowerCase()),
  languageTo: z
    .string()
    .trim()
    .min(1, "Verplicht.")
    .max(40, "Maximaal 40 tekens.")
    .transform((value) => value.toLowerCase()),
  notes: z.string().trim().max(300, "Maximaal 300 tekens."),
  // swornForCombination is a checkbox, read with formCheckbox().
});
