"use server";

import { createContactFormSchema } from "@/lib/contact/schema";
import {
  sendContactConfirmationEmail,
  sendContactEmail,
} from "@/lib/contact/email";
import type {
  ContactFormFieldErrors,
  ContactFormState,
  ContactFormValues,
} from "@/lib/contact/types";
import { getSiteContent } from "@/lib/site-content";
import { isLocale, type Locale } from "@/lib/site";

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function contactFormValues(formData: FormData): ContactFormValues {
  return {
    name: formValue(formData, "name"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone"),
    organization: formValue(formData, "organization"),
    requestType: formValue(formData, "requestType"),
    context: formValue(formData, "context"),
    languageDirection: formValue(formData, "languageDirection"),
    deliveryMode: formValue(formData, "deliveryMode"),
    desiredDateTime: formValue(formData, "desiredDateTime"),
    message: formValue(formData, "message"),
  };
}

export async function submitContactForm(
  locale: Locale,
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (!isLocale(locale)) {
    return {
      status: "error",
      message: "De aanvraag kon niet worden verwerkt.",
    };
  }

  const content = getSiteContent(locale).contact.form;

  if (formValue(formData, "website").trim() !== "") {
    return {
      status: "success",
      message: content.messages.success,
    };
  }

  const values = contactFormValues(formData);
  const schema = createContactFormSchema(content.validation);
  const result = schema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: content.messages.invalidSubmission,
      fieldErrors: result.error.flatten()
        .fieldErrors as ContactFormFieldErrors,
      values,
    };
  }

  const sent = await sendContactEmail(result.data, locale);

  if (!sent) {
    return {
      status: "error",
      message: content.messages.generalError,
      values,
    };
  }

  // Owner delivery is authoritative; visitor confirmation is best-effort.
  await sendContactConfirmationEmail(result.data.email, locale);

  return {
    status: "success",
    message: content.messages.success,
  };
}
