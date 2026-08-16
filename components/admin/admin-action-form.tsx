"use client";

import { useActionState } from "react";

export type FormActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialFormActionState: FormActionState = { status: "idle" };

type AdminActionFormProps = {
  action: (
    previousState: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  className?: string;
};

/**
 * Shared shell for the small per-section edit forms on the booking,
 * interpreter, and customer detail pages: consistent pending/error/success
 * feedback around whatever fields the caller renders as children.
 */
export function AdminActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Bezig…",
  className,
}: AdminActionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFormActionState,
  );

  return (
    <form action={formAction} className={className}>
      {children}

      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p role="status" className="mt-3 text-sm leading-6 text-emerald-700">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="button-primary mt-4 px-5 py-2.5 disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
