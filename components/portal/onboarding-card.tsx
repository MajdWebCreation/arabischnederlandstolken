import Link from "next/link";
import {
  INTERPRETER_COMPLETENESS_SECTION_LABELS,
  type InterpreterCompleteness,
  type InterpreterCompletenessSection,
} from "@/lib/interpreters/completeness";

const SECTION_ORDER: InterpreterCompletenessSection[] = [
  "persoonsgegevens",
  "tolkgegevens",
  "zakelijk",
  "betaalgegevens",
  "facturatie",
];

/**
 * The /tolk dashboard's onboarding entry point. Deliberately framed as
 * progress, not an error state (no red borders, no warning icon) - see the
 * Phase brief: "It should feel like onboarding." Once every section is
 * done this collapses to a compact success card instead of continuing to
 * show the full checklist, so a fully onboarded interpreter's dashboard
 * doesn't stay cluttered with a done-and-dusted card forever.
 */
export function OnboardingCard({ completeness }: { completeness: InterpreterCompleteness }) {
  if (completeness.isComplete) {
    return (
      <div className="content-card flex items-center justify-between gap-3 border-emerald-300 bg-emerald-50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-emerald-900">Account compleet</p>
          <p className="mt-0.5 text-xs text-emerald-800">Gereed voor uitbetaling.</p>
        </div>
        <span aria-hidden className="text-2xl text-emerald-600">
          ✓
        </span>
      </div>
    );
  }

  return (
    <div className="panel px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Maak je account af</h2>
        <span className="text-sm font-semibold text-brand-strong">{completeness.percentage}%</span>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted">
        We hebben nog enkele gegevens nodig voordat je account gereed is voor
        uitbetaling.
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
        <div
          className="h-full rounded-full bg-brand-strong transition-all"
          style={{ width: `${completeness.percentage}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {SECTION_ORDER.map((key) => {
          const done = completeness.sections[key];
          return (
            <li key={key} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden
                className={done ? "text-emerald-600" : "text-line-strong"}
              >
                {done ? "✓" : "○"}
              </span>
              <span className={done ? "text-foreground" : "text-muted"}>
                {INTERPRETER_COMPLETENESS_SECTION_LABELS[key]}
              </span>
            </li>
          );
        })}
      </ul>

      <Link href="/tolk/profiel" className="button-primary mt-5 inline-flex px-5 py-3">
        Account afronden
      </Link>

      {!completeness.paymentReady ? (
        <p className="mt-3 text-xs leading-5 text-amber-800">
          Je account is nog niet gereed voor uitbetaling. Vul eerst je
          zakelijke en betaalgegevens aan.
        </p>
      ) : null}
    </div>
  );
}
