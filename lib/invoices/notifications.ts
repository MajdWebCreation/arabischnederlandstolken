import "server-only";

import { Resend } from "resend";
import { absoluteUrl } from "@/lib/site";

// Reuses the same Resend project/from-address as the rest of the app
// (RESEND_API_KEY / CONTACT_FORM_FROM_EMAIL) - no new secret to configure.
// Its own small client cache, matching lib/contact/email.ts and
// lib/interpreters/notifications.ts rather than importing either (both are
// scoped to their own feature).
let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

function isSafeConfigurationValue(value: string | undefined) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;

  if (!isSafeConfigurationValue(apiKey) || !isSafeConfigurationValue(from)) {
    return null;
  }

  return { apiKey: apiKey!.trim(), from: from!.trim() };
}

export type SendInvoiceEmailInput = {
  to: string;
  invoiceNumber: string;
  totalIncVatLabel: string;
  dueDateLabel: string | null;
  companyName: string;
  pdfBuffer: Buffer;
};

/**
 * The only place an invoice PDF is emailed from. Deliberately says nothing
 * about the underlying booking (no interpreter, no internal notes) - just
 * the invoice number, amount, and due date, which is everything a customer
 * needs and nothing the agency doesn't want printed in an inbox.
 *
 * Returns false on any failure (missing config, Resend error, thrown
 * exception) rather than throwing, so the caller can safely treat "did the
 * email actually go out" as the single source of truth for whether to mark
 * the invoice sent - see sendInvoiceAction in
 * app/admin/(dashboard)/invoices/[id]/actions.ts.
 */
export async function sendInvoiceEmail({
  to,
  invoiceNumber,
  totalIncVatLabel,
  dueDateLabel,
  companyName,
  pdfBuffer,
}: SendInvoiceEmailInput): Promise<boolean> {
  const configuration = getEmailConfiguration();

  if (!configuration || !isSafeConfigurationValue(to)) {
    return false;
  }

  const subject = `Factuur ${invoiceNumber} – ${companyName}`;
  const logoUrl = absoluteUrl("/brand/logo-email.png");

  const textLines = [
    `Bijgaand ontvangt u factuur ${invoiceNumber} van ${companyName}.`,
    "",
    `Totaalbedrag: ${totalIncVatLabel}`,
    dueDateLabel ? `Te voldoen vóór: ${dueDateLabel}` : undefined,
    "",
    "Met vriendelijke groet,",
    companyName,
  ].filter((line): line is string => line !== undefined);

  const html = `<!doctype html>
<html lang="nl" dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#f4f0e8;color:#0f223f;font-family:Arial,'Helvetica Neue',sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f0e8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fffdf9;border:1px solid #d6d1c7;border-radius:20px;">
            <tr>
              <td style="padding:32px;color:#0f223f;text-align:left;">
                <img src="${logoUrl}" width="112" alt="${companyName}" style="display:block;width:112px;max-width:100%;height:auto;margin:0 0 24px;">
                <h1 style="margin:0 0 20px;font-size:22px;line-height:1.35;color:#0c2444;">Factuur ${invoiceNumber}</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#3d4c63;">Bijgaand ontvangt u de factuur als PDF-bijlage.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;width:100%;border-top:1px solid #d6d1c7;border-bottom:1px solid #d6d1c7;">
                  <tr>
                    <td style="padding:12px 0;font-size:14px;color:#5e6b80;">Totaalbedrag</td>
                    <td style="padding:12px 0;font-size:14px;color:#0c2444;font-weight:bold;text-align:right;">${totalIncVatLabel}</td>
                  </tr>
                  ${
                    dueDateLabel
                      ? `<tr><td style="padding:0 0 12px;font-size:14px;color:#5e6b80;">Te voldoen vóór</td><td style="padding:0 0 12px;font-size:14px;color:#0c2444;text-align:right;">${dueDateLabel}</td></tr>`
                      : ""
                  }
                </table>
                <p style="margin:0;font-size:13px;line-height:1.65;color:#5e6b80;">Met vriendelijke groet,</p>
                <p style="margin:2px 0 0;font-size:13px;line-height:1.65;color:#5e6b80;">${companyName}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: to.trim(),
      subject,
      text: textLines.join("\n"),
      html,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return !error;
  } catch {
    return false;
  }
}
