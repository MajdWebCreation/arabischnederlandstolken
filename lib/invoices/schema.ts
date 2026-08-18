import { z } from "zod";
import { parseMoneyInputToCents } from "@/lib/money";

const optionalTrimmed = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : undefined));

const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum.")
  .optional()
  .transform((value) => (value ? value : undefined));

export const updateInvoiceHeaderSchema = z.object({
  invoiceDate: dateField,
  dueDate: dateField,
  paymentTermDays: z.coerce
    .number()
    .int()
    .positive("Betalingstermijn moet een positief aantal dagen zijn."),
  customerNote: optionalTrimmed(500, "Notitie is te lang."),
});

export type UpdateInvoiceHeaderInput = z.infer<typeof updateInvoiceHeaderSchema>;

const moneyField = (message: string) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      const cents = parseMoneyInputToCents(value);

      if (cents === undefined || cents === null) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }

      return cents;
    });

export const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Omschrijving is verplicht.")
    .max(300, "Omschrijving is te lang."),
  quantity: z.coerce
    .number()
    .positive("Aantal moet groter dan 0 zijn.")
    .max(9999, "Aantal is te groot."),
  unitPriceExVatCents: moneyField("Vul een geldig bedrag in."),
  vatRate: z.coerce
    .number()
    .min(0, "BTW-tarief kan niet negatief zijn.")
    .max(100, "BTW-tarief kan niet hoger dan 100% zijn."),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
