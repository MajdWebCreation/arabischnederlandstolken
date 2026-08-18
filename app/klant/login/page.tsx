import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function CustomerLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") redirect("/admin");
    if (profile?.role === "interpreter") redirect("/tolk");
    redirect("/klant");
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
          <p className="eyebrow eyebrow-muted mt-4">Klantportaal</p>
          <h1 className="mt-2 text-xl font-semibold text-foreground">
            Inloggen
          </h1>
        </div>

        <div className="panel px-6 py-7 sm:px-8">
          <LoginForm redirectTo="/klant" />
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-muted">
          Alleen voor klanten met een gekoppeld account. Neem contact op met
          Arabisch Nederlands Tolken als u nog geen inloggegevens heeft.
        </p>
      </div>
    </div>
  );
}
