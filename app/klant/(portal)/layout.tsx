import Image from "next/image";
import Link from "next/link";
import { requireCustomerLayoutSession } from "@/lib/auth/customer";
import { signOut } from "@/lib/auth/actions";
import { CustomerNav } from "@/components/portal/customer-nav";

export const dynamic = "force-dynamic";

export default async function CustomerPortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireCustomerLayoutSession();

  if (session.status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="panel max-w-md px-8 py-9 text-center">
          <p className="eyebrow eyebrow-muted">Geen toegang</p>
          <h1 className="mt-3 text-xl font-semibold text-foreground">
            Dit account heeft geen toegang tot het klantportaal
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            U bent ingelogd als {session.user.email}, maar dit account is
            niet (meer) gekoppeld aan een klantorganisatie. Neem contact op
            met Arabisch Nederlands Tolken als u hier toegang toe zou moeten
            hebben.
          </p>
          <form action={signOut.bind(null, "/klant/login")} className="mt-6">
            <button type="submit" className="button-secondary w-full px-6 py-3">
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { customer } = session;

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/klant"
              className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <Image
                src="/brand/logo-mark.webp"
                alt=""
                width={32}
                height={31}
                className="h-[31px] w-8 shrink-0 object-contain"
              />
              <span className="truncate text-sm font-semibold text-foreground">
                {customer.organisation || customer.name}
              </span>
            </Link>
            <form action={signOut.bind(null, "/klant/login")}>
              <button
                type="submit"
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted-strong"
              >
                Uitloggen
              </button>
            </form>
          </div>
          <CustomerNav />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
    </div>
  );
}
