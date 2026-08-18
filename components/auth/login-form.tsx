"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/auth/actions";
import { initialSignInState } from "@/lib/auth/sign-in-state";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(
    signIn.bind(null, redirectTo),
    initialSignInState,
  );

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          E-mailadres
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          dir="ltr"
          disabled={pending}
          className="form-control mt-2"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-foreground"
        >
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={pending}
          className="form-control mt-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="button-primary w-full px-6 py-3 disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? "Bezig met inloggen…" : "Inloggen"}
      </button>
    </form>
  );
}
