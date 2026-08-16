import Image from "next/image";
import Link from "next/link";
import { requireAdminLayoutSession } from "@/lib/auth/admin";
import { signOut } from "@/lib/auth/actions";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminLayoutSession();

  if (session.status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="panel max-w-md px-8 py-9 text-center">
          <p className="eyebrow eyebrow-muted">Geen toegang</p>
          <h1 className="mt-3 text-xl font-semibold text-foreground">
            Dit account heeft geen beheerdersrechten
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            U bent ingelogd als {session.user.email}, maar dit account is
            niet gemachtigd voor de beheeromgeving. Neem contact op met de
            eigenaar van dit systeem als u hier toegang toe zou moeten
            hebben.
          </p>
          <form action={signOut} className="mt-6">
            <button type="submit" className="button-secondary w-full px-6 py-3">
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <Image
                src="/brand/logo-mark.webp"
                alt=""
                width={34}
                height={33}
                className="h-[33px] w-[34px] shrink-0 object-contain"
              />
              <span className="text-sm font-semibold text-foreground">
                Beheer
              </span>
            </Link>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted-strong"
              >
                Uitloggen
              </button>
            </form>
          </div>

          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-x-auto">
              <AdminNav />
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="max-w-48 truncate text-xs text-muted">
                {session.user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted-strong transition hover:border-brand/40 hover:text-brand-strong"
                >
                  Uitloggen
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
