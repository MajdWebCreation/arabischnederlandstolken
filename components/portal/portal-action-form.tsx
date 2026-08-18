"use client";

import { useActionState } from "react";

export type PortalActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialPortalActionState: PortalActionState = { status: "idle" };

type PortalActionFormProps = {
  action: (
    previousState: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  submitClassName?: string;
  className?: string;
};

/**
 * The interpreter portal's equivalent of components/admin/admin-action-form.tsx
 * - kept as its own small component rather than a shared import so the two
 * portals' UI code stays fully independent of each other.
 */
export function PortalActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Bezig…",
  submitClassName = "button-primary px-5 py-3 disabled:cursor-wait disabled:opacity-65",
  className,
}: PortalActionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPortalActionState,
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

      <button type="submit" disabled={pending} className={submitClassName}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
