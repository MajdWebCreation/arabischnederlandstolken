import "server-only";

import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { InterpreterInvoicePdfViewModel } from "@/lib/interpreter-invoices/pdf-view-model";

// Same reasoning as lib/invoices/pdf-document.tsx: standard PDF-14 Helvetica
// needs no vendored font and renders Dutch diacritics correctly.
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
  banner: "#fdf3e4",
  bannerBorder: "#e3c690",
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
    marginBottom: 14,
  },
  logo: { width: 92, height: 70, objectFit: "contain" },
  headingBlock: { alignItems: "flex-end" },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.bronze,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: colors.navy, marginBottom: 6 },
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
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, fontSize: 8.5, color: colors.mutedLight },
  selfBillingBanner: {
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    backgroundColor: colors.banner,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  selfBillingBannerText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.navy,
    textAlign: "center",
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.bronze, marginBottom: 20 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18, gap: 24 },
  partyBlock: { flexGrow: 1, flexBasis: 0 },
  partyLabel: {
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.mutedLight,
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: colors.navy, marginBottom: 2 },
  partyLine: { fontSize: 9, color: colors.muted, lineHeight: 1.5 },
  referenceLine: { fontSize: 8.5, color: colors.mutedLight, marginBottom: 14 },
  table: { marginTop: 4 },
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
  colQty: { width: 60, textAlign: "right" },
  colUnitPrice: { width: 64, textAlign: "right" },
  colTotal: { width: 68, textAlign: "right" },
  th: { fontSize: 7.5, letterSpacing: 0.6, textTransform: "uppercase", color: colors.mutedLight, fontFamily: "Helvetica-Bold" },
  td: { fontSize: 9, color: colors.ink },
  totalsBlock: { marginTop: 14, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsLabel: { fontSize: 9, color: colors.muted },
  totalsValue: { fontSize: 9, color: colors.ink },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: colors.navy,
  },
  grandTotalLabel: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: colors.navy },
  grandTotalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: colors.navy },
  noteBlock: { marginTop: 22, padding: 10, backgroundColor: colors.surfaceAlt, borderRadius: 3 },
  noteLabel: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.mutedLight,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  noteText: { fontSize: 9, color: colors.muted, lineHeight: 1.5 },
  paymentBlock: { marginTop: 22, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.lineSoft },
  paymentTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: colors.navy, marginBottom: 5 },
  paymentLine: { fontSize: 9, color: colors.muted, lineHeight: 1.6 },
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
  footerText: { fontSize: 7.5, color: colors.mutedLight },
  pageNumber: { position: "absolute", bottom: 26, right: 44, fontSize: 7.5, color: colors.mutedLight },
});

/**
 * Dedicated self-billing template - not a reuse of InvoicePdfDocument, per
 * the brief's explicit instruction. Legally the interpreter's own supplier
 * invoice to Arabisch Nederlands Tolken: "Van" is the interpreter/interpreter
 * business, "Aan" is Arabisch Nederlands Tolken (the buyer), and the
 * mandatory "Factuur uitgereikt door afnemer" banner appears prominently up
 * top - never omitted. Never shows customer price, margin, or any customer
 * invoice content; the view model this reads from has no such field to leak
 * in the first place.
 */
export function InterpreterInvoicePdfDocument({
  viewModel,
  logoSrc,
}: {
  viewModel: InterpreterInvoicePdfViewModel;
  logoSrc: { data: Buffer; format: "png" };
}) {
  return (
    <Document title={`Factuur ${viewModel.invoiceNumberLabel}`} author={viewModel.supplier.name}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's own PDF-drawing Image primitive, not an HTML img. */}
          <Image src={logoSrc} style={styles.logo} />
          <View style={styles.headingBlock}>
            <Text style={styles.eyebrow}>FACTUUR</Text>
            <Text style={styles.invoiceTitle}>{viewModel.invoiceNumberLabel}</Text>
            <Text style={styles.statusPill}>{viewModel.statusLabel}</Text>
            {viewModel.issuedDateLabel ? (
              <View style={styles.metaRow}>
                <Text>Factuurdatum: {viewModel.issuedDateLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.selfBillingBanner} fixed>
          <Text style={styles.selfBillingBannerText}>Factuur uitgereikt door afnemer</Text>
        </View>

        <View style={styles.divider} fixed />

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Van (leverancier)</Text>
            <Text style={styles.partyName}>{viewModel.supplier.name}</Text>
            {viewModel.supplier.tradeName ? (
              <Text style={styles.partyLine}>H.o.d.n. {viewModel.supplier.tradeName}</Text>
            ) : null}
            {viewModel.supplier.addressLines.map((line) => (
              <Text key={line} style={styles.partyLine}>
                {line}
              </Text>
            ))}
            {viewModel.supplier.kvkNumber ? (
              <Text style={styles.partyLine}>KVK {viewModel.supplier.kvkNumber}</Text>
            ) : null}
            {viewModel.supplier.vatId ? (
              <Text style={styles.partyLine}>BTW-id {viewModel.supplier.vatId}</Text>
            ) : null}
          </View>

          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Aan (afnemer)</Text>
            <Text style={styles.partyName}>{viewModel.buyer.name}</Text>
            <Text style={styles.partyLine}>{viewModel.buyer.address}</Text>
            <Text style={styles.partyLine}>KVK {viewModel.buyer.kvk}</Text>
            <Text style={styles.partyLine}>BTW-id {viewModel.buyer.vatId}</Text>
          </View>
        </View>

        {viewModel.serviceReferenceLabel ? (
          <Text style={styles.referenceLine}>
            Referentie: {viewModel.serviceReferenceLabel}
            {viewModel.serviceDateLabel ? ` · ${viewModel.serviceDateLabel}` : ""}
          </Text>
        ) : null}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.th, styles.colDescription]}>Omschrijving</Text>
            <Text style={[styles.th, styles.colQty]}>Aantal</Text>
            <Text style={[styles.th, styles.colUnitPrice]}>Prijs</Text>
            <Text style={[styles.th, styles.colTotal]}>Bedrag</Text>
          </View>

          {viewModel.items.map((item, index) => (
            <View key={`${item.description}-${index}`} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.td, styles.colQty]}>
                {item.quantityLabel}
                {item.unitLabel ? ` ${item.unitLabel}` : ""}
              </Text>
              <Text style={[styles.td, styles.colUnitPrice]}>{item.unitPriceLabel}</Text>
              <Text style={[styles.td, styles.colTotal]}>{item.amountLabel}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotaal excl. btw</Text>
            <Text style={styles.totalsValue}>{viewModel.subtotalLabel}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{viewModel.vatLabel}</Text>
            <Text style={styles.totalsValue}>{viewModel.vatAmountLabel}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Totaal</Text>
            <Text style={styles.grandTotalValue}>{viewModel.totalLabel}</Text>
          </View>
        </View>

        {viewModel.vatTreatment === "kor" ? (
          <View style={styles.noteBlock} wrap={false}>
            <Text style={styles.noteLabel}>Btw-vrijstelling</Text>
            <Text style={styles.noteText}>
              Op grond van de kleineondernemersregeling (KOR) wordt door de leverancier geen btw
              in rekening gebracht.
            </Text>
          </View>
        ) : null}

        {viewModel.fiscalNote ? (
          <View style={styles.noteBlock} wrap={false}>
            <Text style={styles.noteLabel}>Fiscale toelichting</Text>
            <Text style={styles.noteText}>{viewModel.fiscalNote}</Text>
          </View>
        ) : null}

        <View style={styles.paymentBlock} wrap={false}>
          <Text style={styles.paymentTitle}>Betaalgegevens</Text>
          <Text style={styles.paymentLine}>IBAN: {viewModel.supplier.iban}</Text>
          <Text style={styles.paymentLine}>
            T.n.v. {viewModel.supplier.accountHolderName} — o.v.v. {viewModel.invoiceNumberLabel}
          </Text>
          <Text style={styles.paymentLine}>
            Deze factuur wordt door {viewModel.buyer.name} namens de leverancier opgesteld
            (self-billing) en handmatig door {viewModel.buyer.name} uitbetaald.
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {viewModel.buyer.name} · Factuur uitgereikt door afnemer namens {viewModel.supplier.name}
          </Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${pageNumber} / ${totalPages}` : "")}
          fixed
        />
      </Page>
    </Document>
  );
}
