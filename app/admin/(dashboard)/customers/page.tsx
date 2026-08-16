import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listCustomers } from "@/lib/customers/queries";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const customers = await listCustomers(supabase, q);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Beheer</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Klanten
        </h1>
        <p className="mt-1 text-sm text-muted">{customers.length} klanten</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Zoek op naam, organisatie of e-mail"
          className="form-control max-w-md"
        />
        <button type="submit" className="button-secondary px-5 py-2.5">
          Zoeken
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="panel-soft px-5 py-8 text-center text-sm text-muted">
          Geen klanten gevonden.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">Organisatie</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Boekingen</th>
                <th className="px-4 py-3">Laatste boeking</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-line last:border-0 hover:bg-surface-alt/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-semibold text-brand-strong hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {customer.organisation || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <div>{customer.email}</div>
                    {customer.phone ? <div>{customer.phone}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {customer.type === "business" ? "Zakelijk" : "Particulier"}
                  </td>
                  <td className="px-4 py-3 text-muted">{customer.booking_count}</td>
                  <td className="px-4 py-3 text-muted">
                    {customer.latest_booking_date
                      ? new Date(customer.latest_booking_date).toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
