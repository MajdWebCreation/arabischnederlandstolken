import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/app/admin/login/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Any signed-in session goes to /admin - the (dashboard) layout there is
  // the single, authoritative place that decides admin vs access-denied,
  // so this check only needs to know "is anyone logged in", not "are they
  // an admin". That keeps this page free of any risk of a redirect loop.
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/brand/logo-mark.webp"
            alt=""
            width={48}
            height={46}
            className="h-[46px] w-12 object-contain"
          />
          <p className="eyebrow eyebrow-muted mt-4">Beheeromgeving</p>
          <h1 className="mt-2 text-xl font-semibold text-foreground">
            Inloggen
          </h1>
        </div>

        <div className="panel px-6 py-7 sm:px-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-muted">
          Alleen voor geautoriseerde beheerders. Geen account? Deze
          omgeving heeft geen zelfregistratie.
        </p>
      </div>
    </div>
  );
}
