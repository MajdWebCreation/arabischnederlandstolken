import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCustomerBookingHistory,
  getCustomerById,
} from "@/lib/customers/queries";
import { listInvoicesForCustomer } from "@/lib/invoices/queries";
import { listCustomerPortalMemberships } from "@/lib/customers/portal-queries";
import { InvoiceList } from "@/components/admin/invoice-list";
import { CustomerForm } from "@/app/admin/(dashboard)/customers/customer-form";
import {
  CustomerBookingDefaultsForm,
  CustomerPortalSection,
} from "@/app/admin/(dashboard)/customers/[id]/portal-forms";
import { StatusBadge } from "@/components/admin/status-badge";
import { languageLabel } from "@/lib/bookings/constants";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const [customer, history, invoices, memberships] = await Promise.all([
    getCustomerById(supabase, id),
    getCustomerBookingHistory(supabase, id),
    listInvoicesForCustomer(supabase, id),
    listCustomerPortalMemberships(supabase, id),
  ]);

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="text-sm font-medium text-muted hover:text-brand-strong"
        >
          ← Klanten
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          {customer.name}
        </h1>
        {customer.organisation ? (
          <p className="mt-1 text-sm text-muted">{customer.organisation}</p>
        ) : null}
      </div>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Klantgegevens</h2>
        <div className="mt-4">
          <CustomerForm customer={customer} />
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Klantportaal</h2>
        <p className="mt-1 text-xs text-muted">
          Toegang tot /klant voor deze klant. Zie ook: standaardwaarden voor
          nieuwe aanvragen hieronder.
        </p>
        <div className="mt-4">
          <CustomerPortalSection customerId={customer.id} memberships={memberships} />
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">
          Standaardwaarden voor nieuwe aanvragen
        </h2>
        <div className="mt-4">
          <CustomerBookingDefaultsForm customer={customer} />
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Facturen</h2>
        <InvoiceList invoices={invoices} emptyText="Nog geen facturen." />
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">
          Boekingsgeschiedenis
        </h2>

        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nog geen boekingen.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {history.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="text-sm font-semibold text-brand-strong hover:underline"
                  >
                    {booking.booking_number}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {languageLabel(booking.language_from)} →{" "}
                    {languageLabel(booking.language_to)} ·{" "}
                    {booking.requested_date
                      ? new Date(`${booking.requested_date}T00:00:00`).toLocaleDateString("nl-NL")
                      : "Geen datum"}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
