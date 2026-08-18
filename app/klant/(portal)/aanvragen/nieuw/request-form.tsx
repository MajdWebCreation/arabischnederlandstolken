"use client";

import { useActionState, useState } from "react";
import {
  BOOKING_CONTEXTS,
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITIES,
  BOOKING_MODALITY_LABELS,
  COMMON_LANGUAGE_CODES,
  type BookingContext,
  type BookingModality,
} from "@/lib/bookings/constants";
import { createCustomerBookingRequest } from "@/app/klant/(portal)/aanvragen/nieuw/actions";
import { initialFormActionState } from "@/components/admin/admin-action-form";

export type CustomerRequestDefaults = {
  languageFrom: string;
  languageTo: string;
  languageNotes: string;
  context: string;
  modality: string;
  swornRequired: boolean;
  expectedDurationMinutes: string;
  locationName: string;
  locationAddress: string;
};

export function CustomerRequestForm({
  repeatedFromBookingId,
  defaults,
}: {
  repeatedFromBookingId: string | null;
  defaults: CustomerRequestDefaults;
}) {
  const [state, formAction, pending] = useActionState(
    createCustomerBookingRequest.bind(null, repeatedFromBookingId),
    initialFormActionState,
  );
  const [modality, setModality] = useState(defaults.modality);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message ? (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="languageFrom" className="text-sm font-semibold text-foreground">
            Taal van
          </label>
          <select
            id="languageFrom"
            name="languageFrom"
            defaultValue={defaults.languageFrom}
            required
            className="form-control mt-1.5"
          >
            {COMMON_LANGUAGE_CODES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="languageTo" className="text-sm font-semibold text-foreground">
            Taal naar
          </label>
          <select
            id="languageTo"
            name="languageTo"
            defaultValue={defaults.languageTo}
            required
            className="form-control mt-1.5"
          >
            {COMMON_LANGUAGE_CODES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="languageNotes" className="text-sm font-semibold text-foreground">
          Dialect / taalvariant <span className="font-normal text-muted">(optioneel)</span>
        </label>
        <input
          id="languageNotes"
          name="languageNotes"
          type="text"
          defaultValue={defaults.languageNotes}
          placeholder="Bijvoorbeeld: Syrisch/Libanees Arabisch"
          className="form-control mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="context" className="text-sm font-semibold text-foreground">
            Context
          </label>
          <select
            id="context"
            name="context"
            defaultValue={defaults.context || "healthcare"}
            required
            className="form-control mt-1.5"
          >
            {BOOKING_CONTEXTS.map((value) => (
              <option key={value} value={value}>
                {BOOKING_CONTEXT_LABELS[value as BookingContext]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="modality" className="text-sm font-semibold text-foreground">
            Inzetvorm
          </label>
          <select
            id="modality"
            name="modality"
            value={modality}
            onChange={(event) => setModality(event.target.value)}
            required
            className="form-control mt-1.5"
          >
            <option value="" disabled>
              Kies
            </option>
            {BOOKING_MODALITIES.map((value) => (
              <option key={value} value={value}>
                {BOOKING_MODALITY_LABELS[value as BookingModality]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modality === "onsite" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="locationName" className="text-sm font-semibold text-foreground">
              Locatie
            </label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              defaultValue={defaults.locationName}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="locationAddress" className="text-sm font-semibold text-foreground">
              Adres
            </label>
            <input
              id="locationAddress"
              name="locationAddress"
              type="text"
              defaultValue={defaults.locationAddress}
              className="form-control mt-1.5"
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="requestedDate" className="text-sm font-semibold text-foreground">
            Datum
          </label>
          <input
            id="requestedDate"
            name="requestedDate"
            type="date"
            required
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="requestedStartTime" className="text-sm font-semibold text-foreground">
            Tijd
          </label>
          <input
            id="requestedStartTime"
            name="requestedStartTime"
            type="time"
            required
            className="form-control mt-1.5"
          />
        </div>
      </div>

      <div>
        <label htmlFor="expectedDurationMinutes" className="text-sm font-semibold text-foreground">
          Verwachte duur (minuten)
        </label>
        <input
          id="expectedDurationMinutes"
          name="expectedDurationMinutes"
          type="number"
          min={1}
          defaultValue={defaults.expectedDurationMinutes}
          placeholder="Bijvoorbeeld 45"
          className="form-control mt-1.5"
        />
      </div>

      <label className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-3 text-sm has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
        <input
          type="checkbox"
          name="swornRequired"
          defaultChecked={defaults.swornRequired}
          className="h-4 w-4 rounded border-line-strong"
        />
        Beëdigd tolk vereist
      </label>

      <div>
        <label htmlFor="customerMessage" className="text-sm font-semibold text-foreground">
          Toelichting <span className="font-normal text-muted">(optioneel)</span>
        </label>
        <textarea
          id="customerMessage"
          name="customerMessage"
          rows={3}
          placeholder="Alleen operationele informatie - vermijd onnodige gevoelige persoonsgegevens."
          className="form-control mt-1.5"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="button-primary w-full px-6 py-3.5 text-base disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? "Bezig met versturen…" : "Aanvraag versturen"}
      </button>
    </form>
  );
}
