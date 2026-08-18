"use client";

import { useActionState } from "react";
import { changeMyPassword } from "@/app/klant/(portal)/profiel/actions";
import { initialFormActionState } from "@/components/admin/admin-action-form";

export function CustomerPasswordForm() {
  const [state, formAction, pending] = useActionState(changeMyPassword, initialFormActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message ? (
        <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          {state.message}
        </div>
      ) : null}
      {state.status === "success" && state.message ? (
        <div role="status" className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="newPassword" className="text-sm font-semibold text-foreground">
          Nieuw wachtwoord
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="form-control mt-1.5"
        />
        <p className="mt-1 text-xs text-muted">Minimaal 8 tekens.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
          Herhaal nieuw wachtwoord
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="form-control mt-1.5"
        />
      </div>

      <button type="submit" disabled={pending} className="button-primary px-6 py-3 disabled:cursor-wait disabled:opacity-65">
        {pending ? "Bezig met wijzigen…" : "Wachtwoord wijzigen"}
      </button>
    </form>
  );
}
