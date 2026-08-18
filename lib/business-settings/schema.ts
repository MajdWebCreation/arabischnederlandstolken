import { z } from "zod";

const requiredText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, message);

const optionalTrimmed = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : undefined));

export const businessSettingsSchema = z.object({
  companyName: requiredText(160, "Bedrijfsnaam is verplicht."),
  addressLine: requiredText(160, "Adres is verplicht."),
  postalCode: requiredText(20, "Postcode is verplicht."),
  city: requiredText(80, "Plaats is verplicht."),
  country: requiredText(80, "Land is verplicht."),
  kvkNumber: requiredText(20, "KVK-nummer is verplicht."),
  vatId: requiredText(30, "BTW-id is verplicht."),
  iban: requiredText(40, "IBAN is verplicht."),
  website: requiredText(160, "Website is verplicht."),
  email: optionalTrimmed(160, "E-mailadres is te lang."),
  invoicePrefix: requiredText(20, "Factuurprefix is verplicht."),
  paymentTermDays: z.coerce
    .number()
    .int()
    .positive("Betalingstermijn moet een positief aantal dagen zijn."),
  footerText: optionalTrimmed(500, "Voettekst is te lang."),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
