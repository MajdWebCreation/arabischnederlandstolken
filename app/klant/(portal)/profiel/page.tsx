import { requireCustomerLayoutSession } from "@/lib/auth/customer";
import { CustomerProfileForm } from "@/app/klant/(portal)/profiel/profile-form";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const session = await requireCustomerLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Klantportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Profiel</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Organisatiegegevens, klanttype en facturatiebeleid worden beheerd
          door Arabisch Nederlands Tolken. Neem contact met ons op als
          hierin iets moet worden aangepast.
        </p>
      </div>

      <div className="panel px-6 py-6">
        <CustomerProfileForm customer={session.customer} />
      </div>
    </div>
  );
}
