import "server-only";

import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { InvoicePdfViewModel } from "@/lib/invoices/pdf-view-model";

// Standard PDF-14 fonts (Helvetica) need no Font.register call and no
// vendored font file - they render Dutch diacritics (é/ë/ï/etc.) correctly
// out of the box via WinAnsiEncoding, which is what makes them the reliable
// choice here. The site's own IBM Plex Sans is loaded via next/font/google
// at build time and never exists as a standalone file in this repo (see
// the branding inspection in the Phase 3A implementation notes), so
// embedding it would mean vendoring a font ourselves; brand identity on
// this document comes from the real logo and the navy/bronze palette
// below, not from matching the exact typeface.
Font.registerHyphenationCallback((word) => [word]);

const colors = {
  ink: "#0f223f",
  muted: "#3d4c63",
  mutedLight: "#5e6b80",
  line: "#bbb3a4",
  lineSoft: "#d6d1c7",
  navy: "#0c2444",
  bronze: "#b88a4a",
  surfaceAlt: "#f8f3eb",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: colors.ink,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },
  logo: {
    width: 92,
    height: 70,
    objectFit: "contain",
  },
  headingBlock: {
    alignItems: "flex-end",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.bronze,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 6,
  },
  statusPill: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    fontSize: 8.5,
    color: colors.mutedLight,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.bronze,
    marginBottom: 20,
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 24,
  },
  partyBlock: {
    flexGrow: 1,
    flexBasis: 0,
  },
  partyLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.mutedLight,
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.5,
  },
  referenceLine: {
    fontSize: 8.5,
    color: colors.mutedLight,
    marginBottom: 14,
  },
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
  },
  colDescription: { flexGrow: 1, flexBasis: 0, paddingRight: 6 },
  colQty: { width: 40, textAlign: "right" },
  colUnitPrice: { width: 64, textAlign: "right" },
  colVat: { width: 40, textAlign: "right" },
  colTotal: { width: 68, textAlign: "right" },
  th: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.mutedLight,
    fontFamily: "Helvetica-Bold",
  },
  td: {
    fontSize: 9,
    color: colors.ink,
  },
  totalsBlock: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  totalsValue: {
    fontSize: 9,
    color: colors.ink,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: colors.navy,
  },
  grandTotalLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
  },
  noteBlock: {
    marginTop: 22,
    padding: 10,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
  },
  noteLabel: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.mutedLight,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  noteText: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.5,
  },
  paymentBlock: {
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  paymentTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    marginBottom: 5,
  },
  paymentLine: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7.5,
    color: colors.mutedLight,
  },
  pageNumber: {
    position: "absolute",
    bottom: 26,
    right: 44,
    fontSize: 7.5,
    color: colors.mutedLight,
  },
});

export function InvoicePdfDocument({
  viewModel,
  logoSrc,
}: {
  viewModel: InvoicePdfViewModel;
  logoSrc: { data: Buffer; format: "png" };
}) {
  const isDraft = viewModel.status === "draft";

  return (
    <Document
      title={`Factuur ${viewModel.invoiceNumberLabel}`}
      author={viewModel.seller.companyName}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- this is react-pdf's own PDF-drawing Image primitive, not an HTML img; it has no alt prop in its type at all. */}
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headingBlock}>
            <Text style={styles.eyebrow}>FACTUUR</Text>
            <Text style={styles.invoiceTitle}>{viewModel.invoiceNumberLabel}</Text>
            <Text style={styles.statusPill}>{viewModel.statusLabel}</Text>
            <View style={styles.metaRow}>
              <Text>
                {viewModel.invoiceDateLabel
                  ? `Factuurdatum: ${viewModel.invoiceDateLabel}`
                  : "Factuurdatum: nog niet definitief"}
              </Text>
            </View>
            {viewModel.dueDateLabel ? (
              <View style={styles.metaRow}>
                <Text>Vervaldatum: {viewModel.dueDateLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} fixed />

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Van</Text>
            <Text style={styles.partyName}>{viewModel.seller.companyName}</Text>
            {viewModel.seller.addressLines.map((line) => (
              <Text key={line} style={styles.partyLine}>
                {line}
              </Text>
            ))}
            <Text style={styles.partyLine}>KVK {viewModel.seller.kvkNumber}</Text>
            <Text style={styles.partyLine}>BTW-id {viewModel.seller.vatId}</Text>
          </View>

          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Aan</Text>
            <Text style={styles.partyName}>{viewModel.customer.name}</Text>
            {viewModel.customer.organisation ? (
              <Text style={styles.partyLine}>{viewModel.customer.organisation}</Text>
            ) : null}
            {viewModel.customer.addressLines.length > 0 ? (
              viewModel.customer.addressLines.map((line) => (
                <Text key={line} style={styles.partyLine}>
                  {line}
                </Text>
              ))
            ) : (
              <Text style={styles.partyLine}>Factuuradres ontbreekt</Text>
            )}
            {viewModel.customer.vatNumber ? (
              <Text style={styles.partyLine}>BTW-nr {viewModel.customer.vatNumber}</Text>
            ) : null}
          </View>
        </View>

        {viewModel.bookingReferenceLabel ? (
          <Text style={styles.referenceLine}>Referentie: {viewModel.bookingReferenceLabel}</Text>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, styles.colDescription]}>Omschrijving</Text>
            <Text style={[styles.th, styles.colQty]}>Aantal</Text>
            <Text style={[styles.th, styles.colUnitPrice]}>Prijs</Text>
            <Text style={[styles.th, styles.colVat]}>BTW</Text>
            <Text style={[styles.th, styles.colTotal]}>Bedrag</Text>
          </View>

          {viewModel.items.map((item, index) => (
            <View
              key={`${item.description}-${index}`}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={[styles.td, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantityLabel}</Text>
              <Text style={[styles.td, styles.colUnitPrice]}>{item.unitPriceLabel}</Text>
              <Text style={[styles.td, styles.colVat]}>{item.vatRateLabel}</Text>
              <Text style={[styles.td, styles.colTotal]}>{item.totalExVatLabel}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotaal excl. btw</Text>
            <Text style={styles.totalsValue}>{viewModel.subtotalLabel}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Btw</Text>
            <Text style={styles.totalsValue}>{viewModel.totalVatLabel}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Totaal incl. btw</Text>
            <Text style={styles.grandTotalValue}>{viewModel.totalIncVatLabel}</Text>
          </View>
        </View>

        {viewModel.customerNote ? (
          <View style={styles.noteBlock} wrap={false}>
            <Text style={styles.noteLabel}>Opmerking</Text>
            <Text style={styles.noteText}>{viewModel.customerNote}</Text>
          </View>
        ) : null}

        <View style={styles.paymentBlock} wrap={false}>
          <Text style={styles.paymentTitle}>Betaalgegevens</Text>
          <Text style={styles.paymentLine}>IBAN: {viewModel.seller.iban}</Text>
          <Text style={styles.paymentLine}>
            T.n.v. {viewModel.seller.companyName} — o.v.v. {viewModel.invoiceNumberLabel}
          </Text>
          {viewModel.dueDateLabel ? (
            <Text style={styles.paymentLine}>
              Wij verzoeken u het bedrag te voldoen vóór {viewModel.dueDateLabel}.
            </Text>
          ) : (
            <Text style={styles.paymentLine}>
              {isDraft
                ? "Betaaltermijn wordt bepaald zodra deze factuur definitief wordt gemaakt."
                : ""}
            </Text>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {[
              viewModel.seller.companyName,
              viewModel.seller.website,
              viewModel.seller.email,
            ]
              .filter(Boolean)
              .join(" · ")}
            {viewModel.footerText ? ` · ${viewModel.footerText}` : ""}
          </Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );
}
