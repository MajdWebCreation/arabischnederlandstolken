import { z } from "zod";

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
  billingAddress: z.string().trim().max(300, "Maximaal 300 tekens."),
  kvkNumber: z.string().trim().max(40, "Maximaal 40 tekens."),
  vatNumber: z.string().trim().max(40, "Maximaal 40 tekens."),
  internalNotes: z.string().trim().max(4000, "Maximaal 4000 tekens."),
});
