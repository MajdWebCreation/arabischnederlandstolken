import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import {
  getResendConfiguration,
  renderBrandedEmailHtml,
  renderDetailRowsHtml,
} from "@/lib/email/layout";

// Its own small Resend client cache, matching every other notification
// module in this app (lib/contact/email.ts, lib/interpreters/notifications.ts,
// lib/customers/notifications.ts) rather than sharing a client instance
// across features - only the config-reading itself is shared, via
// getResendConfiguration().
let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

function isSafeConfigurationValue(value: string | undefined | null) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

const TERMS_PDF_FILENAME = "Arabisch-Nederlands-Tolken-Tarieven-en-Algemene-Voorwaarden.pdf";

let cachedTermsPdf: Buffer | undefined;
let cachedLogoPng: Buffer | undefined;

/**
 * Read once per server process and cached, mirroring getLogoBuffer() in
 * lib/invoices/pdf-render.ts exactly - read from disk (public/legal/...,
 * deployed as an ordinary project asset, not a machine-specific absolute
 * path) rather than fetched over HTTP, so sending an invoice email never
 * depends on the app's own base URL being reachable from wherever this
 * runs. The document itself is never regenerated or rewritten here - it is
 * the exact PDF already on file.
 */
async function getTermsPdfBuffer(): Promise<Buffer> {
  if (!cachedTermsPdf) {
    cachedTermsPdf = await readFile(path.join(process.cwd(), "public/legal", TERMS_PDF_FILENAME));
  }

  return cachedTermsPdf;
}

/** The real project logo, embedded as a CID inline attachment (see logoSrc: "cid:logo" below) rather than a remote <img src> - reliable across Gmail/Outlook/mobile without depending on the app being reachable over HTTP. */
async function getLogoPngBuffer(): Promise<Buffer> {
  if (!cachedLogoPng) {
    cachedLogoPng = await readFile(path.join(process.cwd(), "public/brand/logo-email.png"));
  }

  return cachedLogoPng;
}

export type SendInvoiceEmailInput = {
  to: string;
  contactName: string;
  invoiceNumber: string;
  invoiceDateLabel: string | null;
  dueDateLabel: string | null;
  totalIncVatLabel: string;
  iban: string;
  companyName: string;
  invoicePdfBuffer: Buffer;
  /** null when this invoice currently has no active Mollie payment link (already paid, or a zero/negative total) - see getOrCreateInvoicePaymentLink() in lib/invoices/mollie.ts. The email then omits the payment button/Mollie copy entirely and only mentions the manual IBAN transfer. */
  paymentUrl: string | null;
};

/**
 * The only place an invoice email is ever built and sent - the branded
 * HTML, the plain-text fallback, both PDF attachments (the issued invoice
 * and the Tarieven en Algemene Voorwaarden), the inline logo, and (when
 * applicable) the Mollie payment button all live here. Says nothing about
 * the underlying booking beyond what a customer needs to pay: no
 * interpreter, no internal notes, no agency margin, no Mollie API details.
 *
 * Returns false on any failure (missing config, unreadable attachment,
 * Resend error, thrown exception) rather than throwing, so the caller can
 * safely treat "did the email actually go out" as the single source of
 * truth for whether to mark the invoice sent - see sendInvoiceAction in
 * app/admin/(dashboard)/invoices/[id]/actions.ts.
 */
export async function sendInvoiceEmail({
  to,
  contactName,
  invoiceNumber,
  invoiceDateLabel,
  dueDateLabel,
  totalIncVatLabel,
  iban,
  companyName,
  invoicePdfBuffer,
  paymentUrl,
}: SendInvoiceEmailInput): Promise<boolean> {
  const configuration = getResendConfiguration();

  if (!configuration || !isSafeConfigurationValue(to)) {
    return false;
  }

  let termsPdfBuffer: Buffer;
  let logoBuffer: Buffer;

  try {
    [termsPdfBuffer, logoBuffer] = await Promise.all([getTermsPdfBuffer(), getLogoPngBuffer()]);
  } catch {
    return false;
  }

  const subject = `Factuur ${invoiceNumber} – ${companyName}`;

  const detailRows: Array<[string, string]> = [
    ["Factuurnummer", invoiceNumber],
    ["Factuurbedrag", totalIncVatLabel],
  ];
  if (invoiceDateLabel) detailRows.push(["Factuurdatum", invoiceDateLabel]);
  if (dueDateLabel) detailRows.push(["Uiterste betaaldatum", dueDateLabel]);

  const calloutHtml =
    renderDetailRowsHtml(detailRows) +
    (paymentUrl
      ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#3d4c63;">U kunt de factuur eenvoudig online betalen via onderstaande knop.</p>`
      : "");

  const footerParagraphs: string[] = [];

  if (paymentUrl) {
    footerParagraphs.push(
      `Werkt de knop hierboven niet? Gebruik deze link om te betalen: <a href="${paymentUrl}" style="color:#0c2444;">${paymentUrl}</a>`,
      "U wordt hiervoor doorgestuurd naar de beveiligde betaalomgeving van Mollie.",
      `U kunt het bedrag ook handmatig overmaken naar het IBAN dat op de factuur vermeld staat (${iban}), onder vermelding van het factuurnummer.`,
    );
  } else {
    footerParagraphs.push(
      `U kunt het bedrag handmatig overmaken naar het IBAN dat op de factuur vermeld staat (${iban}), onder vermelding van het factuurnummer.`,
    );
  }

  footerParagraphs.push(
    "In de bijlagen vindt u de factuur en onze Tarieven en Algemene Voorwaarden.",
    "Heeft u vragen over de factuur? Dan kunt u gewoon op deze e-mail reageren.",
  );

  const footerNote = footerParagraphs
    .map((paragraph) => `<span style="display:block;margin:0 0 8px;">${paragraph}</span>`)
    .join("");

  const html = renderBrandedEmailHtml({
    subject,
    heading: `Factuur ${invoiceNumber}`,
    bodyParagraphsHtml: [
      `Beste ${contactName},`,
      `Bedankt voor uw opdracht bij ${companyName}.`,
      `In de bijlage vindt u factuur <strong>${invoiceNumber}</strong> voor onze dienstverlening.`,
    ],
    calloutHtml,
    action: paymentUrl ? { label: "FACTUUR BETALEN", href: paymentUrl } : undefined,
    footerNote,
    logoSrc: "cid:logo",
  });

  const textLines = [
    `Beste ${contactName},`,
    "",
    `Bedankt voor uw opdracht bij ${companyName}.`,
    `In de bijlage vindt u factuur ${invoiceNumber} voor onze dienstverlening.`,
    "",
    `Factuurnummer: ${invoiceNumber}`,
    `Factuurbedrag: ${totalIncVatLabel}`,
    invoiceDateLabel ? `Factuurdatum: ${invoiceDateLabel}` : undefined,
    dueDateLabel ? `Uiterste betaaldatum: ${dueDateLabel}` : undefined,
    "",
    paymentUrl ? `U kunt de factuur online betalen via: ${paymentUrl}` : undefined,
    paymentUrl
      ? "U wordt hiervoor doorgestuurd naar de beveiligde betaalomgeving van Mollie."
      : undefined,
    `U kunt het bedrag ook handmatig overmaken naar IBAN ${iban}, onder vermelding van het factuurnummer.`,
    "",
    "In de bijlagen vindt u de factuur en onze Tarieven en Algemene Voorwaarden.",
    "Heeft u vragen over de factuur? Dan kunt u gewoon op deze e-mail reageren.",
    "",
    "Met vriendelijke groet,",
    companyName,
  ].filter((line): line is string => line !== undefined);

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
          content: invoicePdfBuffer,
        },
        {
          filename: TERMS_PDF_FILENAME,
          content: termsPdfBuffer,
        },
        {
          filename: "logo.png",
          content: logoBuffer,
          contentType: "image/png",
          contentId: "logo",
        },
      ],
    });

    return !error;
  } catch {
    return false;
  }
}
