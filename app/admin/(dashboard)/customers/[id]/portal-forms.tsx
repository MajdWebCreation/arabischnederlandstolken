"use client";

import { useTransition } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  linkCustomerAccount,
  unlinkCustomerAccount,
  updateCustomerBookingDefaults,
} from "@/app/admin/(dashboard)/customers/actions";
import type { CustomerPortalMembershipRow } from "@/lib/customers/portal-queries";
import type { CustomerRow } from "@/lib/customers/queries";
import {
  BOOKING_CONTEXTS,
  BOOKING_CONTEXT_LABELS,
  BOOKING_MODALITIES,
  BOOKING_MODALITY_LABELS,
  type BookingContext,
  type BookingModality,
} from "@/lib/bookings/constants";

function MembershipRow({ customerId, membership }: { customerId: string; membership: CustomerPortalMembershipRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5">
      <div>
        <p className="text-sm font-medium text-foreground">{membership.email ?? "Onbekend e-mailadres"}</p>
        <p className="text-xs text-muted">
          {membership.active ? "Actief" : "Gedeactiveerd"} · {membership.role}
        </p>
      </div>
      {membership.active ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => unlinkCustomerAccount(customerId, membership.id))}
          className="button-secondary px-3 py-1.5 text-xs disabled:cursor-wait disabled:opacity-65"
        >
          Ontkoppelen
        </button>
      ) : null}
    </li>
  );
}

export function CustomerPortalSection({
  customerId,
  memberships,
}: {
  customerId: string;
  memberships: CustomerPortalMembershipRow[];
}) {
  const activeMemberships = memberships.filter((m) => m.active);

  return (
    <div>
      {memberships.length > 0 ? (
        <ul className="space-y-2">
          {memberships.map((membership) => (
            <MembershipRow key={membership.id} customerId={customerId} membership={membership} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nog geen portaalaccount gekoppeld.</p>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <p className="text-xs text-muted">
          Maak eerst een account aan via Supabase Dashboard &gt; Authentication
          &gt; Users (met het e-mailadres van de klant), en koppel dat account
          daarna hieronder. Een organisatie kan meer dan één gekoppeld account
          hebben.
        </p>
        <AdminActionForm
          action={linkCustomerAccount.bind(null, customerId)}
          submitLabel={activeMemberships.length > 0 ? "Nog een account koppelen" : "Koppelen"}
          className="mt-3"
        >
          <label htmlFor="link-customer-email" className="text-xs font-semibold uppercase tracking-wide text-muted">
            E-mailadres van het account
          </label>
          <input
            id="link-customer-email"
            name="email"
            type="email"
            dir="ltr"
            required
            className="form-control mt-1.5"
          />
        </AdminActionForm>
      </div>
    </div>
  );
}

export function CustomerBookingDefaultsForm({ customer }: { customer: CustomerRow }) {
  return (
    <AdminActionForm
      action={updateCustomerBookingDefaults.bind(null, customer.id)}
      submitLabel="Standaardwaarden opslaan"
    >
      <p className="text-xs text-muted">
        Gebruikt alleen om een nieuwe aanvraag van deze klant in het
        klantportaal voor te vullen. Nooit bindend - de klant kan dit altijd
        per aanvraag aanpassen.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="defaultLanguageFrom" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Taal van
          </label>
          <input
            id="defaultLanguageFrom"
            name="defaultLanguageFrom"
            type="text"
            dir="ltr"
            defaultValue={customer.default_language_from ?? ""}
            placeholder="ar"
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="defaultLanguageTo" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Taal naar
          </label>
          <input
            id="defaultLanguageTo"
            name="defaultLanguageTo"
            type="text"
            dir="ltr"
            defaultValue={customer.default_language_to ?? ""}
            placeholder="nl"
            className="form-control mt-1.5"
          />
        </div>
      </div>
      <div className="mt-3">
        <label htmlFor="defaultLanguageNotes" className="text-xs font-semibold uppercase tracking-wide text-muted">
          Dialect/taalvariant
        </label>
        <input
          id="defaultLanguageNotes"
          name="defaultLanguageNotes"
          type="text"
          defaultValue={customer.default_language_notes ?? ""}
          className="form-control mt-1.5"
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="defaultContext" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Context
          </label>
          <select id="defaultContext" name="defaultContext" defaultValue={customer.default_context ?? ""} className="form-control mt-1.5">
            <option value="">Geen standaard</option>
            {BOOKING_CONTEXTS.map((value) => (
              <option key={value} value={value}>
                {BOOKING_CONTEXT_LABELS[value as BookingContext]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="defaultModality" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Inzetvorm
          </label>
          <select id="defaultModality" name="defaultModality" defaultValue={customer.default_modality ?? ""} className="form-control mt-1.5">
            <option value="">Geen standaard</option>
            {BOOKING_MODALITIES.map((value) => (
              <option key={value} value={value}>
                {BOOKING_MODALITY_LABELS[value as BookingModality]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="defaultDurationMinutes" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Duur (minuten)
          </label>
          <input
            id="defaultDurationMinutes"
            name="defaultDurationMinutes"
            type="text"
            inputMode="numeric"
            defaultValue={customer.default_duration_minutes?.toString() ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <label className="mt-6 flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
          <input
            type="checkbox"
            name="defaultSwornRequired"
            defaultChecked={customer.default_sworn_required}
            className="h-4 w-4 rounded border-line-strong"
          />
          Beëdigd tolk
        </label>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="defaultLocationName" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Standaardlocatie
          </label>
          <input
            id="defaultLocationName"
            name="defaultLocationName"
            type="text"
            defaultValue={customer.default_location_name ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="defaultLocationAddress" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Adres
          </label>
          <input
            id="defaultLocationAddress"
            name="defaultLocationAddress"
            type="text"
            defaultValue={customer.default_location_address ?? ""}
            className="form-control mt-1.5"
          />
        </div>
      </div>
    </AdminActionForm>
  );
}
