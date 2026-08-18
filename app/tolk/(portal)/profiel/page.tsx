import { createClient } from "@/lib/supabase/server";
import { requireInterpreterLayoutSession } from "@/lib/auth/interpreter";
import { getInterpreterById } from "@/lib/interpreters/queries";
import { getInterpreterCapabilities } from "@/lib/interpreters/matching";
import { languageLabel } from "@/lib/bookings/constants";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import { updateMyContactDetails } from "@/app/tolk/(portal)/profiel/actions";

export const dynamic = "force-dynamic";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

function isRbtvExpired(expiryDate: string | null) {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date(new Date().toDateString());
}

export default async function InterpreterProfilePage() {
  const session = await requireInterpreterLayoutSession();

  if (session.status !== "authorized") {
    return null;
  }

  const supabase = await createClient();
  const [interpreter, capabilities] = await Promise.all([
    getInterpreterById(supabase, session.interpreter.id),
    getInterpreterCapabilities(supabase, session.interpreter.id),
  ]);

  if (!interpreter) {
    return null;
  }

  const dialects = capabilities.filter((c) => c.capability_tags?.category === "dialect");
  const specialties = capabilities.filter((c) => c.capability_tags?.category === "specialty");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow eyebrow-muted">Tolkenportaal</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {interpreter.first_name} {interpreter.last_name}
        </h1>
      </div>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Contactgegevens</h2>
        <p className="mt-1 text-xs text-muted">
          Naam, e-mail en kwalificaties worden door de beheerder onderhouden.
          Telefoon en stad kunt u zelf bijwerken.
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={fieldLabel}>E-mailadres</dt>
            <dd className="mt-1 text-sm text-foreground">{interpreter.email}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-line pt-5">
          <PortalActionForm action={updateMyContactDetails} submitLabel="Opslaan">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className={fieldLabel}>
                  Telefoon
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  dir="ltr"
                  defaultValue={interpreter.phone ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
              <div>
                <label htmlFor="city" className={fieldLabel}>
                  Stad
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  defaultValue={interpreter.city ?? ""}
                  className="form-control mt-1.5"
                />
              </div>
            </div>
          </PortalActionForm>
        </div>
      </section>

      <section className="panel px-6 py-6">
        <h2 className="text-base font-semibold text-foreground">Kwalificaties</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={fieldLabel}>Beëdigd tolk</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.sworn_interpreter ? "Ja" : "Nee"}
            </dd>
          </div>
          <div>
            <dt className={fieldLabel}>Rbtv-nummer</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.rbtv_number || "Niet geregistreerd"}
            </dd>
          </div>
          <div>
            <dt className={fieldLabel}>Rbtv geldig tot</dt>
            <dd className="mt-1 text-sm text-foreground">
              {interpreter.rbtv_expiry_date || "Onbekend"}
              {isRbtvExpired(interpreter.rbtv_expiry_date) ? (
                <span className="ms-2 text-xs font-semibold text-red-700">Verlopen</span>
              ) : null}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Taalcombinaties</h3>
          {interpreter.interpreter_languages.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nog geen talen geregistreerd.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {interpreter.interpreter_languages.map((language) => (
                <li key={language.id} className="text-sm text-foreground">
                  {languageLabel(language.language_from)} → {languageLabel(language.language_to)}
                  {language.sworn_for_combination ? (
                    <span className="ms-2 chip">Beëdigd</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Dialecten</h3>
          {dialects.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Geen dialecten geregistreerd.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-2">
              {dialects.map((c) => (
                <span key={c.id} className="chip">
                  {c.capability_tags?.label}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <h3 className="text-sm font-semibold text-foreground">Specialisaties</h3>
          {specialties.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Geen specialisaties geregistreerd.</p>
          ) : (
            <p className="mt-2 flex flex-wrap gap-2">
              {specialties.map((c) => (
                <span key={c.id} className="chip">
                  {c.capability_tags?.label}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
