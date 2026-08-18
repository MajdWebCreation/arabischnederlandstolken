import { createClient } from "@/lib/supabase/server";
import { getBusinessSettings } from "@/lib/business-settings/queries";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  updateBusinessSettings,
  updateInterpreterTargetMargin,
} from "@/app/admin/(dashboard)/settings/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const settings = await getBusinessSettings(supabase);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Beheer</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Bedrijfsgegevens
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
          Deze gegevens verschijnen op nieuwe facturen. Al uitgegeven facturen
          blijven ongewijzigd als u dit later aanpast - elke factuur legt zijn
          eigen momentopname vast op het moment dat hij definitief wordt
          gemaakt.
        </p>
      </div>

      <section className="panel px-6 py-6">
        <AdminActionForm action={updateBusinessSettings} submitLabel="Opslaan">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="companyName"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Bedrijfsnaam
              </label>
              <input
                id="companyName"
                name="companyName"
                defaultValue={settings.company_name}
                required
                className="form-control mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="addressLine"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Adres
              </label>
              <input
                id="addressLine"
                name="addressLine"
                defaultValue={settings.address_line}
                required
                className="form-control mt-1.5"
              />
            </div>
            <div>
              <label
                htmlFor="postalCode"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Postcode
              </label>
              <input
                id="postalCode"
                name="postalCode"
                defaultValue={settings.postal_code}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Plaats
              </label>
              <input
                id="city"
                name="city"
                defaultValue={settings.city}
                required
                className="form-control mt-1.5"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Land
              </label>
              <input
                id="country"
                name="country"
                defaultValue={settings.country}
                required
                className="form-control mt-1.5"
              />
            </div>
            <div>
              <label
                htmlFor="kvkNumber"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                KVK-nummer
              </label>
              <input
                id="kvkNumber"
                name="kvkNumber"
                defaultValue={settings.kvk_number}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="vatId"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                BTW-id
              </label>
              <input
                id="vatId"
                name="vatId"
                defaultValue={settings.vat_id}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="iban"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                IBAN
              </label>
              <input
                id="iban"
                name="iban"
                defaultValue={settings.iban}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="website"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Website
              </label>
              <input
                id="website"
                name="website"
                defaultValue={settings.website}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                E-mailadres (optioneel, op factuur)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={settings.email ?? ""}
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="invoicePrefix"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Factuurprefix
              </label>
              <input
                id="invoicePrefix"
                name="invoicePrefix"
                defaultValue={settings.invoice_prefix}
                required
                className="form-control mt-1.5"
                dir="ltr"
              />
            </div>
            <div>
              <label
                htmlFor="paymentTermDays"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Betalingstermijn (dagen)
              </label>
              <input
                id="paymentTermDays"
                name="paymentTermDays"
                type="number"
                min={1}
                defaultValue={settings.payment_term_days}
                required
                className="form-control mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="footerText"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Voettekst op factuur (optioneel)
              </label>
              <textarea
                id="footerText"
                name="footerText"
                defaultValue={settings.footer_text ?? ""}
                rows={2}
                className="form-control mt-1.5"
              />
            </div>
          </div>
        </AdminActionForm>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">
          Tolkmarge (alleen zichtbaar voor beheerders)
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Hulpmiddel voor het inschatten van een tolkenvergoeding bij een
          boeking. Nooit zichtbaar voor klanten of tolken, en nooit
          automatisch de daadwerkelijk afgesproken tolkkosten - die worden
          altijd apart en expliciet door de beheerder vastgelegd.
        </p>
        <div className="mt-4">
          <AdminActionForm action={updateInterpreterTargetMargin} submitLabel="Opslaan">
            <div className="max-w-xs">
              <label
                htmlFor="defaultInterpreterTargetMarginPercent"
                className="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Standaard doelmarge tolkopdrachten
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="defaultInterpreterTargetMarginPercent"
                  name="defaultInterpreterTargetMarginPercent"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  defaultValue={Number(settings.default_interpreter_target_margin_percent)}
                  required
                  className="form-control"
                />
                <span className="text-sm text-muted">%</span>
              </div>
            </div>
          </AdminActionForm>
        </div>
      </section>
    </div>
  );
}
