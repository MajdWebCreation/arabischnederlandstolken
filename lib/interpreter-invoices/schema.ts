import { z } from "zod";
import { parseMoneyInputToCents } from "@/lib/money";
import { INTERPRETER_VAT_TREATMENTS } from "@/lib/interpreters/constants";

const optionalTrimmed = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : undefined));

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

export const interpreterInvoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Omschrijving is verplicht.")
    .max(300, "Omschrijving is te lang."),
  quantity: z.coerce
    .number()
    .positive("Aantal moet groter dan 0 zijn.")
    .max(9999, "Aantal is te groot."),
  unit: optionalTrimmed(20, "Eenheid is te lang."),
  unitPriceExVatCents: moneyField("Vul een geldig bedrag in."),
});

export type InterpreterInvoiceItemInput = z.infer<typeof interpreterInvoiceItemSchema>;

/** vatRate is required only when vatTreatment is standard_vat, validated in the Server Action (the RPC itself re-validates server-side regardless - see issue_interpreter_invoice()). */
export const updateInterpreterInvoiceVatSchema = z.object({
  vatTreatment: z.enum(INTERPRETER_VAT_TREATMENTS),
  vatRate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  fiscalNote: optionalTrimmed(1000, "Toelichting is te lang."),
});

export type UpdateInterpreterInvoiceVatInput = z.infer<typeof updateInterpreterInvoiceVatSchema>;

export const requestSettlementChangeSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Geef aan wat er niet klopt.")
    .max(1000, "Bericht is te lang."),
});

export type RequestSettlementChangeInput = z.infer<typeof requestSettlementChangeSchema>;
