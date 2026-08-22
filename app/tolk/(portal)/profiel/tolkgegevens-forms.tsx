"use client";

import { useTransition } from "react";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import {
  addMyLanguage,
  removeMyLanguage,
  toggleMyCapability,
} from "@/app/tolk/(portal)/profiel/actions";
import type { CapabilityTagRow } from "@/lib/interpreters/matching";

export function AddMyLanguageForm() {
  return (
    <PortalActionForm action={addMyLanguage} submitLabel="Toevoegen" className="mt-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="languageFrom" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Van
          </label>
          <input
            id="languageFrom"
            name="languageFrom"
            type="text"
            required
            placeholder="ar"
            dir="ltr"
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="languageTo" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Naar
          </label>
          <input
            id="languageTo"
            name="languageTo"
            type="text"
            required
            placeholder="nl"
            dir="ltr"
            className="form-control mt-1.5"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" name="swornForCombination" className="h-4 w-4 rounded border-line-strong" />
            Beëdigd
          </label>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Een nieuwe beëdigde taalcombinatie wordt pas voor opdrachten met
        beëdiging vereist meegeteld nadat een beheerder dit heeft
        gecontroleerd.
      </p>
    </PortalActionForm>
  );
}

export function RemoveMyLanguageButton({ languageId }: { languageId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => removeMyLanguage(languageId))}
      className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-60"
    >
      Verwijderen
    </button>
  );
}

export function MyCapabilityCheckbox({
  tag,
  checked,
}: {
  tag: CapabilityTagRow;
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
      <input
        type="checkbox"
        defaultChecked={checked}
        disabled={isPending}
        className="h-4 w-4 rounded border-line-strong"
        onChange={(event) => {
          const next = event.target.checked;
          startTransition(async () => {
            await toggleMyCapability(tag.id, next);
          });
        }}
      />
      {tag.label}
    </label>
  );
}
