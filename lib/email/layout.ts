import "server-only";

import { absoluteUrl, organizationName } from "@/lib/site";

/**
 * Shared branded HTML shell for every Phase 4 transactional email
 * (customer request/offer/confirmation/cancellation emails, interpreter
 * confirmation/replacement emails). Visually matches the shell already
 * used by lib/contact/email.ts and lib/invoices/notifications.ts, but
 * factored into one place so those new templates don't each re-implement
 * the same table-based HTML - see the Phase 4 brief's "do not scatter
 * hardcoded email HTML" instruction.
 *
 * Existing Phase 1-3 email code (contact confirmations, invoice emails,
 * interpreter portal notifications) deliberately keeps its own inline
 * shell rather than being migrated onto this one - those are shipped,
 * working templates, and switching them over here is not something Phase 4
 * needs to touch.
 */
export type EmailAction = { label: string; href: string };

export function renderBrandedEmailHtml({
  subject,
  heading,
  bodyParagraphsHtml,
  calloutHtml,
  action,
  footerNote,
}: {
  subject: string;
  heading: string;
  bodyParagraphsHtml: string[];
  calloutHtml?: string;
  action?: EmailAction;
  footerNote?: string;
}): string {
  const logoUrl = absoluteUrl("/brand/logo-email.png");
  const paragraphs = bodyParagraphsHtml
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#3d4c63;">${paragraph}</p>`,
    )
    .join("");

  const calloutBlock = calloutHtml
    ? `<div style="margin:20px 0;padding:16px;border-radius:14px;border:1px solid #d6d1c7;background:#f8f3eb;font-size:14px;line-height:1.7;color:#3d4c63;">${calloutHtml}</div>`
    : "";

  const actionBlock = action
    ? `<p style="margin:24px 0 0;"><a href="${action.href}" style="display:inline-block;background:#0c2444;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${action.label}</a></p>`
    : "";

  const footerBlock = footerNote
    ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.65;color:#5e6b80;">${footerNote}</p>`
    : "";

  return `<!doctype html>
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
                <img src="${logoUrl}" width="112" alt="${organizationName}" style="display:block;width:112px;max-width:100%;height:auto;margin:0 0 24px;">
                <h1 style="margin:0 0 20px;font-size:22px;line-height:1.35;color:#0c2444;">${heading}</h1>
                ${paragraphs}
                ${calloutBlock}
                ${actionBlock}
                ${footerBlock}
                <p style="margin:24px 0 0;font-size:13px;line-height:1.65;color:#5e6b80;">Met vriendelijke groet,</p>
                <p style="margin:2px 0 0;font-size:13px;line-height:1.65;color:#5e6b80;">${organizationName}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Row/value pairs rendered as a simple key-value table inside a callout, e.g. booking summary details. */
export function renderDetailRowsHtml(rows: Array<[string, string]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;"><span style="color:#5e6b80;">${label}</span><span style="color:#0c2444;font-weight:600;text-align:right;">${value}</span></div>`,
    )
    .join("");
}

export function getResendConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FORM_FROM_EMAIL;
  const adminTo = process.env.CONTACT_FORM_TO_EMAIL;

  const isSafe = (value: string | undefined) =>
    Boolean(value?.trim() && !/[\r\n]/.test(value));

  if (!isSafe(apiKey) || !isSafe(from)) {
    return null;
  }

  return {
    apiKey: apiKey!.trim(),
    from: from!.trim(),
    adminTo: isSafe(adminTo) ? adminTo!.trim() : null,
  };
}

export function isSafeEmailAddress(value: string | undefined | null) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}
