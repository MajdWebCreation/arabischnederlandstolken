"use client";

import { useActionState } from "react";
import { updateCustomerProfile } from "@/app/klant/(portal)/profiel/actions";
import { initialFormActionState } from "@/components/admin/admin-action-form";
import type { Database } from "@/lib/supabase/database.types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

export function CustomerProfileForm({ customer }: { customer: CustomerRow }) {
  const [state, formAction, pending] = useActionState(updateCustomerProfile, initialFormActionState);

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && state.message ? (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" && state.message ? (
        <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="text-sm font-semibold text-foreground">
          Naam / contactpersoon
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={customer.name}
          required
          className="form-control mt-1.5"
        />
      </div>

      <div>
        <label htmlFor="phone" className="text-sm font-semibold text-foreground">
          Telefoon
        </label>
        <input id="phone" name="phone" type="tel" dir="ltr" defaultValue={customer.phone ?? ""} className="form-control mt-1.5" />
      </div>

      <div className="border-t border-line pt-5">
        <h3 className="text-sm font-semibold text-foreground">Facturatiegegevens</h3>
        <div className="mt-3 space-y-4">
          <div>
            <label htmlFor="billingName" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Factuurnaam
            </label>
            <input id="billingName" name="billingName" type="text" defaultValue={customer.billing_name ?? ""} className="form-control mt-1.5" />
          </div>
          <div>
            <label htmlFor="billingEmail" className="text-xs font-semibold uppercase tracking-wide text-muted">
              Factuur-e-mailadres
            </label>
            <input id="billingEmail" name="billingEmail" type="email" dir="ltr" defaultValue={customer.billing_email ?? ""} className="form-control mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="billingStreet" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Straat
              </label>
              <input id="billingStreet" name="billingStreet" type="text" defaultValue={customer.billing_street ?? ""} className="form-control mt-1.5" />
            </div>
            <div>
              <label htmlFor="billingHouseNumber" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Huisnummer
              </label>
              <input id="billingHouseNumber" name="billingHouseNumber" type="text" defaultValue={customer.billing_house_number ?? ""} className="form-control mt-1.5" />
            </div>
            <div>
              <label htmlFor="billingHouseNumberAddition" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Toevoeging
              </label>
              <input
                id="billingHouseNumberAddition"
                name="billingHouseNumberAddition"
                type="text"
                defaultValue={customer.billing_house_number_addition ?? ""}
                className="form-control mt-1.5"
              />
            </div>
            <div>
              <label htmlFor="billingPostalCode" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Postcode
              </label>
              <input id="billingPostalCode" name="billingPostalCode" type="text" defaultValue={customer.billing_postal_code ?? ""} className="form-control mt-1.5" />
            </div>
            <div>
              <label htmlFor="billingCity" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Plaats
              </label>
              <input id="billingCity" name="billingCity" type="text" defaultValue={customer.billing_city ?? ""} className="form-control mt-1.5" />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={pending} className="button-primary w-full px-6 py-3 disabled:cursor-wait disabled:opacity-65">
        {pending ? "Bezig met opslaan…" : "Opslaan"}
      </button>
    </form>
  );
}
