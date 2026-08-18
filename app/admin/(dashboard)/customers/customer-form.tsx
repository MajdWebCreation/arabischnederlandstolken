"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { updateCustomer } from "@/app/admin/(dashboard)/customers/actions";
import type { CustomerRow } from "@/lib/customers/queries";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

export function CustomerForm({ customer }: { customer: CustomerRow }) {
  const action = updateCustomer.bind(null, customer.id);

  return (
    <AdminActionForm action={action} submitLabel="Klantgegevens opslaan">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={fieldLabel}>
            Naam
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={customer.name}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="type" className={fieldLabel}>
            Type klant
          </label>
          <select
            id="type"
            name="type"
            defaultValue={customer.type}
            className="form-control mt-1.5"
          >
            <option value="individual">Particulier</option>
            <option value="business">Zakelijk</option>
          </select>
        </div>
        <div>
          <label htmlFor="organisation" className={fieldLabel}>
            Organisatie
          </label>
          <input
            id="organisation"
            name="organisation"
            type="text"
            defaultValue={customer.organisation ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            E-mailadres
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            defaultValue={customer.email}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="phone" className={fieldLabel}>
            Telefoon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            defaultValue={customer.phone ?? ""}
            className="form-control mt-1.5"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <h3 className="text-sm font-semibold text-foreground">Facturatiegegevens</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="billingName" className={fieldLabel}>
              Factuurnaam
            </label>
            <input
              id="billingName"
              name="billingName"
              type="text"
              defaultValue={customer.billing_name ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="billingEmail" className={fieldLabel}>
              Factuur e-mailadres
            </label>
            <input
              id="billingEmail"
              name="billingEmail"
              type="email"
              dir="ltr"
              defaultValue={customer.billing_email ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="billingStreet" className={fieldLabel}>
              Straatnaam
            </label>
            <input
              id="billingStreet"
              name="billingStreet"
              type="text"
              defaultValue={customer.billing_street ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="billingHouseNumber" className={fieldLabel}>
              Huisnummer
            </label>
            <input
              id="billingHouseNumber"
              name="billingHouseNumber"
              type="text"
              dir="ltr"
              defaultValue={customer.billing_house_number ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="billingHouseNumberAddition" className={fieldLabel}>
              Toevoeging (optioneel)
            </label>
            <input
              id="billingHouseNumberAddition"
              name="billingHouseNumberAddition"
              type="text"
              dir="ltr"
              defaultValue={customer.billing_house_number_addition ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="billingPostalCode" className={fieldLabel}>
              Postcode
            </label>
            <input
              id="billingPostalCode"
              name="billingPostalCode"
              type="text"
              dir="ltr"
              defaultValue={customer.billing_postal_code ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="billingCity" className={fieldLabel}>
              Plaats
            </label>
            <input
              id="billingCity"
              name="billingCity"
              type="text"
              defaultValue={customer.billing_city ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          {customer.billing_address ? (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-line-strong bg-surface-alt/60 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Vorig vrij-tekstadres (alleen ter referentie)
              </p>
              <p className="mt-1 text-sm text-muted-strong">{customer.billing_address}</p>
            </div>
          ) : null}
          <div>
            <label htmlFor="kvkNumber" className={fieldLabel}>
              KVK-nummer
            </label>
            <input
              id="kvkNumber"
              name="kvkNumber"
              type="text"
              dir="ltr"
              defaultValue={customer.kvk_number ?? ""}
              className="form-control mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="vatNumber" className={fieldLabel}>
              Btw-nummer
            </label>
            <input
              id="vatNumber"
              name="vatNumber"
              type="text"
              dir="ltr"
              defaultValue={customer.vat_number ?? ""}
              className="form-control mt-1.5"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <label htmlFor="internalNotes" className={fieldLabel}>
          Interne notities
        </label>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={4}
          defaultValue={customer.internal_notes ?? ""}
          className="form-control mt-1.5 resize-y"
        />
      </div>
    </AdminActionForm>
  );
}
