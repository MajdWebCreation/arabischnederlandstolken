import Link from "next/link";
import { createInterpreter } from "@/app/admin/(dashboard)/interpreters/actions";
import { InterpreterForm } from "@/app/admin/(dashboard)/interpreters/interpreter-form";

export const dynamic = "force-dynamic";

export default function NewInterpreterPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/interpreters"
          className="text-sm font-medium text-muted hover:text-brand-strong"
        >
          ← Tolken
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Tolk toevoegen
        </h1>
      </div>

      <section className="panel px-6 py-6">
        <InterpreterForm action={createInterpreter} submitLabel="Tolk aanmaken" />
      </section>
    </div>
  );
}
