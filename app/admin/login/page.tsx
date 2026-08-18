import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Any signed-in session goes onward - the destination layout is the
  // single, authoritative place that decides actual access, so this check
  // only needs to know "is anyone logged in" plus, as a helpful nicety,
  // which portal their role actually belongs to (an interpreter who lands
  // here by mistake is sent to their own portal instead of hitting an
  // access-denied page). That keeps this page free of any risk of a
  // redirect loop.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile?.role === "interpreter" ? "/tolk" : "/admin");
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
          <LoginForm redirectTo="/admin" />
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-muted">
          Alleen voor geautoriseerde beheerders. Geen account? Deze
          omgeving heeft geen zelfregistratie.
        </p>
      </div>
    </div>
  );
}
