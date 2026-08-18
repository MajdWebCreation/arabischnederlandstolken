import { z } from "zod";
import { parseMoneyInputToCents } from "@/lib/money";

const requiredMoneyField = z.string().transform((raw, ctx) => {
  const cents = parseMoneyInputToCents(raw);

  if (cents === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Vul een geldig bedrag in (bijvoorbeeld 180 of 180,50).",
    });
    return z.NEVER;
  }

  if (cents === null) {
    ctx.addIssue({
      code: "custom",
      message: "Vul de vergoeding voor de tolk in.",
    });
    return z.NEVER;
  }

  return cents;
});

const optionalMoneyField = z.string().transform((raw, ctx) => {
  const cents = parseMoneyInputToCents(raw);

  if (cents === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "Vul een geldig bedrag in (bijvoorbeeld 30 of 30,50).",
    });
    return z.NEVER;
  }

  return cents;
});

const optionalExpiryField = z
  .string()
  .trim()
  .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), {
    message: "Vul een geldige datum/tijd in.",
  });

export const inviteInterpreterSchema = z.object({
  interpreterId: z
    .string()
    .trim()
    .regex(/^[0-9a-f-]{36}$/i, "Ongeldige tolk."),
  offeredCompensationExVat: requiredMoneyField,
  offeredTravelCompensationExVat: optionalMoneyField,
  messageToInterpreter: z.string().trim().max(1000, "Maximaal 1000 tekens."),
  expiresAt: optionalExpiryField,
});

export const publishOpenAssignmentSchema = z.object({
  offeredCompensationExVat: requiredMoneyField,
  offeredTravelCompensationExVat: optionalMoneyField,
  description: z.string().trim().max(1000, "Maximaal 1000 tekens."),
  expiresAt: optionalExpiryField,
});
