import { z } from "zod";
import {
  contextValues,
  deliveryModeValues,
  languageDirectionValues,
  requestTypeValues,
  type ContactValidationMessages,
} from "@/lib/contact/types";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function createContactFormSchema(
  messages: ContactValidationMessages,
) {
  const optionalText = (maximum: number, error: string) =>
    z.preprocess(
      normalizeOptionalText,
      z.string().max(maximum, error).optional(),
    );

  return z.object({
    name: z
      .string()
      .trim()
      .min(1, messages.nameRequired)
      .max(120, messages.nameTooLong),
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .max(254, messages.emailTooLong)
      .email(messages.emailInvalid),
    phone: optionalText(40, messages.phoneTooLong),
    organization: optionalText(160, messages.organizationTooLong),
    requestType: z.enum(requestTypeValues, {
      error: messages.invalidOption,
    }),
    context: z.enum(contextValues, {
      error: messages.invalidOption,
    }),
    languageDirection: z.enum(languageDirectionValues, {
      error: messages.invalidOption,
    }),
    deliveryMode: z.preprocess(
      normalizeOptionalText,
      z
        .enum(deliveryModeValues, {
          error: messages.invalidOption,
        })
        .optional(),
    ),
    desiredDateTime: optionalText(
      120,
      messages.desiredDateTimeTooLong,
    ),
    message: z
      .string()
      .trim()
      .min(1, messages.messageRequired)
      .min(10, messages.messageTooShort)
      .max(3000, messages.messageTooLong),
  });
}

export type ContactFormData = z.infer<
  ReturnType<typeof createContactFormSchema>
>;
