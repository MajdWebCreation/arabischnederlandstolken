import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import {
  getResendConfiguration,
  renderBrandedEmailHtml,
  renderDetailRowsHtml,
} from "@/lib/email/layout";
import { absoluteUrl } from "@/lib/site";

// Its own small Resend client cache, matching every other notification
// module in this app.
let resendClient: Resend | undefined;
let resendClientKey: string | undefined;

function getResend(apiKey: string) {
  if (!resendClient || resendClientKey !== apiKey) {
    resendClient = new Resend(apiKey);
    resendClientKey = apiKey;
  }

  return resendClient;
}

let cachedLogoPng: Buffer | undefined;

async function getLogoPngBuffer(): Promise<Buffer> {
  if (!cachedLogoPng) {
    cachedLogoPng = await readFile(path.join(process.cwd(), "public/brand/logo-email.png"));
  }

  return cachedLogoPng;
}

function isSafeEmailAddress(value: string | undefined | null) {
  return Boolean(value?.trim() && !/[\r\n]/.test(value));
}

async function sendBrandedInterpreterEmail({
  to,
  subject,
  heading,
  bodyParagraphsHtml,
  calloutHtml,
  actionLabel,
  actionPath,
  attachments,
}: {
  to: string;
  subject: string;
  heading: string;
  bodyParagraphsHtml: string[];
  calloutHtml?: string;
  actionLabel: string;
  /** Defaults to the general facturen list; pass e.g. `/tolk/facturen/<id>` to deep-link a specific settlement (brief section 6). */
  actionPath?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<boolean> {
  const configuration = getResendConfiguration();

  if (!configuration || !isSafeEmailAddress(to)) {
    return false;
  }

  let logoBuffer: Buffer;

  try {
    logoBuffer = await getLogoPngBuffer();
  } catch {
    return false;
  }

  const portalUrl = absoluteUrl(actionPath ?? "/tolk/facturen");

  const html = renderBrandedEmailHtml({
    subject,
    heading,
    bodyParagraphsHtml,
    calloutHtml,
    action: { label: actionLabel, href: portalUrl },
    logoSrc: "cid:logo",
  });

  // Every notification deliberately says as little as possible about the
  // settlement's actual contents in plain text - no amount, no customer/
  // booking detail - matching lib/interpreters/notifications.ts's "the
  // database is authoritative, email only tells you where to look"
  // principle, since these emails never carry customer prices/margin and
  // must not carry banking/fiscal data unnecessarily either (brief section
  // 19).
  const text = [
    ...bodyParagraphsHtml.map((p) => p.replace(/<[^>]+>/g, "")),
    "",
    `Bekijk uw facturen: ${portalUrl}`,
  ].join("\n");

  try {
    const { error } = await getResend(configuration.apiKey).emails.send({
      from: configuration.from,
      to: to.trim(),
      subject,
      text,
      html,
      attachments: [
        {
          filename: "logo.png",
          content: logoBuffer,
          contentType: "image/png",
          contentId: "logo",
        },
        ...(attachments ?? []),
      ],
    });

    return !error;
  } catch {
    return false;
  }
}

export type SettlementReviewEmailDetails = {
  bookingNumber: string;
  /** Already formatted for display (e.g. "10 augustus 2026") or null if not yet known. */
  serviceDateLabel: string | null;
  totalIncVatLabel: string;
  invoiceId: string;
};

function settlementReviewDetailRows({ bookingNumber, serviceDateLabel, totalIncVatLabel }: SettlementReviewEmailDetails) {
  const rows: Array<[string, string]> = [["Boeking", bookingNumber]];
  if (serviceDateLabel) rows.push(["Datum", serviceDateLabel]);
  rows.push(["Voorgesteld bedrag", totalIncVatLabel]);
  return rows;
}

/** A. Settlement is ready for review. Never includes customer price/margin/customer invoice/internal notes - the view model this reads from (InterpreterInvoiceWithDetails) has no such field to begin with. */
export async function sendSettlementReadyForReviewEmail(
  interpreterEmail: string,
  details: SettlementReviewEmailDetails,
): Promise<boolean> {
  return sendBrandedInterpreterEmail({
    to: interpreterEmail,
    subject: "Afrekening klaar ter controle",
    heading: "Er staat een afrekening voor u klaar.",
    bodyParagraphsHtml: [
      "Er staat een afrekening voor een door u uitgevoerde opdracht voor u klaar ter controle.",
      "Controleer de gegevens en geef aan of u akkoord bent, of vraag een wijziging aan.",
    ],
    calloutHtml: renderDetailRowsHtml(settlementReviewDetailRows(details)),
    actionLabel: "BEKIJK AFREKENING",
    actionPath: `/tolk/facturen/${details.invoiceId}`,
  });
}

/** B. A requested correction has been processed and resubmitted. */
export async function sendSettlementResubmittedEmail(
  interpreterEmail: string,
  details: SettlementReviewEmailDetails,
): Promise<boolean> {
  return sendBrandedInterpreterEmail({
    to: interpreterEmail,
    subject: "Aangepaste afrekening klaar ter controle",
    heading: "Uw afrekening is aangepast.",
    bodyParagraphsHtml: [
      "Naar aanleiding van uw opmerking is de afrekening aangepast en staat deze opnieuw voor u klaar ter controle.",
    ],
    calloutHtml: renderDetailRowsHtml(settlementReviewDetailRows(details)),
    actionLabel: "BEKIJK AFREKENING",
    actionPath: `/tolk/facturen/${details.invoiceId}`,
  });
}

/** C. Official self-billing invoice has been issued - the PDF is attached, per brief section 19. */
export async function sendInterpreterInvoiceIssuedEmail({
  to,
  invoiceId,
  invoiceNumber,
  totalIncVatLabel,
  pdfBuffer,
}: {
  to: string;
  invoiceId: string;
  invoiceNumber: string;
  totalIncVatLabel: string;
  pdfBuffer: Buffer;
}): Promise<boolean> {
  return sendBrandedInterpreterEmail({
    to,
    subject: `Self-billing factuur ${invoiceNumber}`,
    heading: `Factuur ${invoiceNumber} is definitief`,
    bodyParagraphsHtml: [
      "De officiële self-billing factuur voor uw afrekening is uitgegeven. U vindt deze als bijlage en in uw facturenoverzicht.",
    ],
    calloutHtml: renderDetailRowsHtml([
      ["Factuurnummer", invoiceNumber],
      ["Bedrag", totalIncVatLabel],
    ]),
    actionLabel: "BEKIJK FACTUUR",
    actionPath: `/tolk/facturen/${invoiceId}`,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
  });
}

/** D. Invoice is marked paid. */
export async function sendInterpreterInvoicePaidEmail({
  to,
  invoiceId,
  invoiceNumber,
}: {
  to: string;
  invoiceId: string;
  invoiceNumber: string;
}): Promise<boolean> {
  return sendBrandedInterpreterEmail({
    to,
    subject: `Factuur ${invoiceNumber} betaald`,
    heading: "Uw factuur is betaald",
    bodyParagraphsHtml: [`Factuur ${invoiceNumber} is gemarkeerd als betaald.`],
    actionLabel: "BEKIJK FACTUUR",
    actionPath: `/tolk/facturen/${invoiceId}`,
  });
}
