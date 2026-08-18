"use client";

import { useState } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  updateBookingDetails,
  updateBookingFinancials,
  updateBookingInternalNotes,
  updateBookingInterpreter,
  updateBookingStatus,
} from "@/app/admin/(dashboard)/bookings/[id]/actions";
import {
  BOOKING_MODALITIES,
  BOOKING_MODALITY_LABELS,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
} from "@/lib/bookings/constants";
import {
  centsToInputValue,
  numberToCents,
  parseMoneyInputToCents,
  formatCentsAsCurrency,
} from "@/lib/money";
import type { BookingDetail } from "@/lib/bookings/queries";
import type { InterpreterListRow } from "@/lib/interpreters/queries";
import type { CapabilityTagRow } from "@/lib/interpreters/matching";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

export function BookingStatusForm({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const action = updateBookingStatus.bind(null, bookingId);

  return (
    <AdminActionForm action={action} submitLabel="Status opslaan">
      <label htmlFor="status" className={fieldLabel}>
        Status
      </label>
      <select
        id="status"
        name="status"
        defaultValue={currentStatus}
        className="form-control mt-1.5"
      >
        {BOOKING_STATUSES.map((value) => (
          <option key={value} value={value}>
            {BOOKING_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </AdminActionForm>
  );
}

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

export function BookingInterpreterForm({
  bookingId,
  currentInterpreterId,
  interpreters,
  swornRequired,
}: {
  bookingId: string;
  currentInterpreterId: string | null;
  interpreters: InterpreterListRow[];
  swornRequired: boolean;
}) {
  const [selectedId, setSelectedId] = useState(currentInterpreterId ?? "");
  const action = updateBookingInterpreter.bind(null, bookingId);

  const selected = interpreters.find((i) => i.id === selectedId);
  const showSwornWarning =
    swornRequired &&
    selected &&
    (!selected.sworn_interpreter ||
      !selected.rbtv_number ||
      isRbtvExpired(selected.rbtv_expiry_date));

  return (
    <AdminActionForm
      action={action}
      submitLabel={selectedId ? "Tolk toewijzen" : "Tolk verwijderen"}
    >
      <label htmlFor="interpreterId" className={fieldLabel}>
        Toegewezen tolk
      </label>
      <select
        id="interpreterId"
        name="interpreterId"
        value={selectedId}
        onChange={(event) => setSelectedId(event.target.value)}
        className="form-control mt-1.5"
      >
        <option value="">Geen tolk toegewezen</option>
        {interpreters.map((interpreter) => (
          <option
            key={interpreter.id}
            value={interpreter.id}
            disabled={!interpreter.active}
          >
            {interpreter.first_name} {interpreter.last_name}
            {interpreter.city ? ` · ${interpreter.city}` : ""}
            {interpreter.sworn_interpreter ? " · beëdigd" : ""}
            {!interpreter.active ? " · inactief" : ""}
          </option>
        ))}
      </select>

      {selected ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted">
          <dt>Talen</dt>
          <dd>
            {selected.interpreter_languages.length > 0
              ? selected.interpreter_languages
                  .map((l) => `${l.language_from}→${l.language_to}`)
                  .join(", ")
              : "Geen talen geregistreerd"}
          </dd>
          <dt>Beëdigd</dt>
          <dd>{selected.sworn_interpreter ? "Ja" : "Nee"}</dd>
          <dt>Rbtv-nummer</dt>
          <dd>{selected.rbtv_number || "Niet geregistreerd"}</dd>
          <dt>Rbtv geldig tot</dt>
          <dd>{selected.rbtv_expiry_date || "Onbekend"}</dd>
        </dl>
      ) : null}

      {showSwornWarning ? (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-900">
          Deze boeking vereist een beëdigd tolk, maar de geselecteerde tolk
          heeft geen beëdigde status, geen Rbtv-nummer, of een verlopen
          Rbtv-registratie volgens de handmatig bijgehouden gegevens. Dit is
          geen onafhankelijke verificatie - controleer dit zelf voordat u
          bevestigt.
        </p>
      ) : null}
    </AdminActionForm>
  );
}

export function BookingFinancialsForm({
  bookingId,
  booking,
  defaultTargetMarginPercent,
}: {
  bookingId: string;
  booking: BookingDetail;
  /** business_settings.default_interpreter_target_margin_percent - an admin-only planning default, never the agreed amount itself. See the margin helper block below. */
  defaultTargetMarginPercent: number;
}) {
  const action = updateBookingFinancials.bind(null, bookingId);

  // Klantprijs/Tolkkosten are lifted into controlled state (unlike every
  // other field on this form, still plain uncontrolled defaultValue inputs)
  // purely so the margin helper block below can recalculate live as the
  // admin types - see brief section 4 ("immediately recalculate"). Both
  // still submit via their unchanged `name` attributes exactly as before;
  // nothing about how this form saves has changed.
  const [customerPriceInput, setCustomerPriceInput] = useState(
    centsToInputValue(numberToCents(booking.customer_price_ex_vat)),
  );
  const [interpreterCostInput, setInterpreterCostInput] = useState(
    centsToInputValue(numberToCents(booking.interpreter_cost_ex_vat)),
  );
  // Local-only "what if" input, deliberately never submitted with the form
  // (no `name` attribute) - this is purely a planning helper, never
  // persisted anywhere itself. See lib/business-settings for the stored
  // default this starts from.
  const [targetMarginPercent, setTargetMarginPercent] = useState(
    String(defaultTargetMarginPercent),
  );

  const customerPriceCents = parseMoneyInputToCents(customerPriceInput);
  const interpreterCostCents = parseMoneyInputToCents(interpreterCostInput);
  const targetMarginValue = Number(targetMarginPercent);

  const suggestedInterpreterCostCents =
    customerPriceCents !== null &&
    customerPriceCents !== undefined &&
    Number.isFinite(targetMarginValue)
      ? Math.round(customerPriceCents * (1 - targetMarginValue / 100))
      : null;

  const actualMarginCents =
    customerPriceCents !== null &&
    customerPriceCents !== undefined &&
    interpreterCostCents !== null &&
    interpreterCostCents !== undefined
      ? customerPriceCents - interpreterCostCents
      : null;

  const actualMarginPercentLabel =
    actualMarginCents !== null && customerPriceCents
      ? `${((actualMarginCents / customerPriceCents) * 100).toFixed(2)}%`
      : "—";

  const moneyInput = (
    name: string,
    label: string,
    cents: number | null,
  ) => (
    <div>
      <label htmlFor={name} className={fieldLabel}>
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-sm text-muted">€</span>
        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          defaultValue={centsToInputValue(cents)}
          placeholder="0,00"
          className="form-control"
        />
      </div>
    </div>
  );

  return (
    <AdminActionForm action={action} submitLabel="Financiën opslaan">
      <div className="mb-6 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Tolkmarge-hulpmiddel (alleen zichtbaar voor beheerders)
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Marge op de tolkdienst zelf, exclusief reiskosten. Uitsluitend een
          planningshulpmiddel - werkt de daadwerkelijk afgesproken
          tolkkosten hieronder niet automatisch bij.
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Klantprijs excl. btw</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {formatCentsAsCurrency(customerPriceCents ?? null)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">
              <label htmlFor="targetMarginPercent">Doelmarge %</label>
            </dt>
            <div className="mt-0.5 flex items-center gap-1">
              <input
                id="targetMarginPercent"
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={targetMarginPercent}
                onChange={(event) => setTargetMarginPercent(event.target.value)}
                className="form-control w-20 py-1 text-sm"
              />
              <span className="text-sm text-muted">%</span>
            </div>
          </div>
          <div>
            <dt className="text-xs text-muted">Voorgestelde tolkenvergoeding</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {formatCentsAsCurrency(suggestedInterpreterCostCents)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Werkelijke tolkenvergoeding</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {formatCentsAsCurrency(interpreterCostCents ?? null)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Werkelijke marge €</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {formatCentsAsCurrency(actualMarginCents)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Werkelijke marge %</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {actualMarginPercentLabel}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="customerPriceExVat" className={fieldLabel}>
            Klantprijs excl. btw
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              id="customerPriceExVat"
              name="customerPriceExVat"
              type="text"
              inputMode="decimal"
              value={customerPriceInput}
              onChange={(event) => setCustomerPriceInput(event.target.value)}
              placeholder="0,00"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label htmlFor="interpreterCostExVat" className={fieldLabel}>
            Tolkkosten excl. btw
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              id="interpreterCostExVat"
              name="interpreterCostExVat"
              type="text"
              inputMode="decimal"
              value={interpreterCostInput}
              onChange={(event) => setInterpreterCostInput(event.target.value)}
              placeholder="0,00"
              className="form-control"
            />
          </div>
        </div>
        {moneyInput(
          "customerTravelFeeExVat",
          "Reiskosten klant excl. btw",
          numberToCents(booking.customer_travel_fee_ex_vat),
        )}
        {moneyInput(
          "interpreterTravelCostExVat",
          "Reiskosten tolk excl. btw",
          numberToCents(booking.interpreter_travel_cost_ex_vat),
        )}
        {moneyInput(
          "customerOvertimeRateExVat",
          "Overuurtarief klant excl. btw",
          numberToCents(booking.customer_overtime_rate_ex_vat),
        )}
        {moneyInput(
          "interpreterOvertimeRateExVat",
          "Overuurtarief tolk excl. btw",
          numberToCents(booking.interpreter_overtime_rate_ex_vat),
        )}
        <div>
          <label htmlFor="vatRate" className={fieldLabel}>
            Btw-percentage
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              id="vatRate"
              name="vatRate"
              type="text"
              inputMode="decimal"
              defaultValue={String(booking.vat_rate)}
              className="form-control"
            />
            <span className="text-sm text-muted">%</span>
          </div>
        </div>
      </div>
    </AdminActionForm>
  );
}

export function BookingInternalNotesForm({
  bookingId,
  internalNotes,
}: {
  bookingId: string;
  internalNotes: string | null;
}) {
  const action = updateBookingInternalNotes.bind(null, bookingId);

  return (
    <AdminActionForm action={action} submitLabel="Notitie opslaan">
      <label htmlFor="internalNotes" className={fieldLabel}>
        Interne notities (alleen zichtbaar voor beheerders)
      </label>
      <textarea
        id="internalNotes"
        name="internalNotes"
        rows={5}
        defaultValue={internalNotes ?? ""}
        className="form-control mt-1.5 resize-y"
      />
    </AdminActionForm>
  );
}

export function BookingDetailsForm({
  bookingId,
  booking,
  dialectTags,
}: {
  bookingId: string;
  booking: BookingDetail;
  dialectTags: CapabilityTagRow[];
}) {
  const action = updateBookingDetails.bind(null, bookingId);

  return (
    <AdminActionForm action={action} submitLabel="Boekingsgegevens opslaan">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="requestedDate" className={fieldLabel}>
            Datum
          </label>
          <input
            id="requestedDate"
            name="requestedDate"
            type="date"
            defaultValue={booking.requested_date ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="requestedStartTime" className={fieldLabel}>
            Starttijd
          </label>
          <input
            id="requestedStartTime"
            name="requestedStartTime"
            type="time"
            defaultValue={booking.requested_start_time?.slice(0, 5) ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="expectedDurationMinutes" className={fieldLabel}>
            Verwachte duur (minuten)
          </label>
          <input
            id="expectedDurationMinutes"
            name="expectedDurationMinutes"
            type="text"
            inputMode="numeric"
            defaultValue={booking.expected_duration_minutes ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="actualDurationMinutes" className={fieldLabel}>
            Werkelijke duur (minuten)
          </label>
          <input
            id="actualDurationMinutes"
            name="actualDurationMinutes"
            type="text"
            inputMode="numeric"
            defaultValue={booking.actual_duration_minutes ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="modality" className={fieldLabel}>
            Inzetvorm
          </label>
          <select
            id="modality"
            name="modality"
            defaultValue={booking.modality ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Nog niet bekend</option>
            {BOOKING_MODALITIES.map((value) => (
              <option key={value} value={value}>
                {BOOKING_MODALITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="swornRequired"
              defaultChecked={booking.sworn_required}
              className="h-4 w-4 rounded border-line-strong"
            />
            Beëdigd tolk vereist
          </label>
        </div>
        <div>
          <label htmlFor="locationName" className={fieldLabel}>
            Locatienaam
          </label>
          <input
            id="locationName"
            name="locationName"
            type="text"
            defaultValue={booking.location_name ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="locationAddress" className={fieldLabel}>
            Adres
          </label>
          <input
            id="locationAddress"
            name="locationAddress"
            type="text"
            defaultValue={booking.location_address ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="languageNotes" className={fieldLabel}>
            Opmerkingen over taal/dialect
          </label>
          <input
            id="languageNotes"
            name="languageNotes"
            type="text"
            defaultValue={booking.language_notes ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="requiredDialectTagId" className={fieldLabel}>
            Vereist dialect (voor matching)
          </label>
          <select
            id="requiredDialectTagId"
            name="requiredDialectTagId"
            defaultValue={booking.required_dialect_tag_id ?? ""}
            className="form-control mt-1.5"
          >
            <option value="">Geen specifiek dialect vereist</option>
            {dialectTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="onsiteContactName" className={fieldLabel}>
            Contactpersoon ter plaatse
          </label>
          <input
            id="onsiteContactName"
            name="onsiteContactName"
            type="text"
            placeholder="Bijv. balie, receptie, casemanager"
            defaultValue={booking.onsite_contact_name ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="onsiteContactPhone" className={fieldLabel}>
            Telefoonnummer ter plaatse
          </label>
          <input
            id="onsiteContactPhone"
            name="onsiteContactPhone"
            type="tel"
            dir="ltr"
            defaultValue={booking.onsite_contact_phone ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="interpreterBrief" className={fieldLabel}>
            Omschrijving/instructies voor de tolk
          </label>
          <p className="mt-1 text-xs text-muted">
            Zichtbaar voor kandidaat-tolken (om te beslissen) en voor de
            geselecteerde tolk (als instructie). Nooit het volledige bericht
            van de klant - dat blijft admin-only.
          </p>
          <textarea
            id="interpreterBrief"
            name="interpreterBrief"
            rows={3}
            defaultValue={booking.interpreter_brief ?? ""}
            className="form-control mt-1.5 resize-y"
          />
        </div>
      </div>
    </AdminActionForm>
  );
}
