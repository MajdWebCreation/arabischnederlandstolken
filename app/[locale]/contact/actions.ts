"use server";

import { createContactFormSchema } from "@/lib/contact/schema";
import {
  sendBookingSaveFailedAlertEmail,
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
import { submitWebsiteBookingRequest } from "@/lib/bookings/submit-website-request";

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

  // The database is the source of truth. Save first; only report success
  // once the booking genuinely exists. A failure here must never be papered
  // over by sending the normal "your request was received" notification -
  // that email's entire content would be a false claim.
  const saved = await submitWebsiteBookingRequest(result.data, locale);

  if (!saved.ok) {
    // Best-effort break-glass alert so a real enquiry isn't silently lost
    // to a transient database problem. sendBookingSaveFailedAlertEmail
    // never throws; if this also fails, the customer still has the mailto
    // fallback link already visible on the page.
    await sendBookingSaveFailedAlertEmail(result.data, locale, saved.error);

    return {
      status: "error",
      message: content.messages.generalError,
      values,
    };
  }

  // From here on the booking is safely stored, so this is the success path
  // regardless of email deliverability - email is a notification about a
  // saved booking, not the record of it.
  const notified = await sendContactEmail(result.data, locale, {
    id: saved.bookingId,
    number: saved.bookingNumber,
  });

  if (!notified) {
    // Non-sensitive marker only (booking number, no message content) so a
    // broken notification pipeline is at least visible in server logs.
    console.error(
      `Booking ${saved.bookingNumber} saved, but the owner notification email failed to send.`,
    );
  }

  await sendContactConfirmationEmail(result.data.email, locale);

  return {
    status: "success",
    message: content.messages.success,
  };
}
