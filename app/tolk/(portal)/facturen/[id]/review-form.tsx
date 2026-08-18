"use client";

import { useActionState, useState } from "react";
import {
  approveSettlementAction,
  requestSettlementChangeAction,
} from "@/app/tolk/(portal)/facturen/[id]/actions";
import { initialFormActionState } from "@/components/admin/admin-action-form";

export function SettlementReviewActions({ invoiceId }: { invoiceId: string }) {
  const boundApprove = approveSettlementAction.bind(null, invoiceId);
  const [approveState, approveAction, approvePending] = useActionState(
    boundApprove,
    initialFormActionState,
  );

  const boundRequestChange = requestSettlementChangeAction.bind(null, invoiceId);
  const [changeState, changeAction, changePending] = useActionState(
    boundRequestChange,
    initialFormActionState,
  );

  const [showChangeForm, setShowChangeForm] = useState(false);

  return (
    <div className="space-y-4">
      {approveState.status === "error" && approveState.message ? (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {approveState.message}
        </p>
      ) : null}
      {approveState.status === "success" && approveState.message ? (
        <p role="status" className="text-sm leading-6 text-emerald-700">
          {approveState.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <form action={approveAction}>
          <button
            type="submit"
            disabled={approvePending}
            className="button-primary px-6 py-3 disabled:cursor-wait disabled:opacity-65"
          >
            {approvePending ? "Bezig…" : "Akkoord"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowChangeForm((value) => !value)}
          className="button-secondary px-6 py-3"
        >
          Wijziging aanvragen
        </button>
      </div>

      {showChangeForm ? (
        <form action={changeAction} className="space-y-3 rounded-2xl border border-line bg-surface-alt/60 px-4 py-4">
          <div>
            <label htmlFor="message" className="text-sm font-semibold text-foreground">
              Wat klopt er niet?
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              minLength={3}
              className="form-control mt-1.5"
              placeholder="Bijvoorbeeld: de reiskosten kloppen niet, de duur was langer, ..."
            />
          </div>
          {changeState.status === "error" && changeState.message ? (
            <p role="alert" className="text-sm leading-6 text-red-700">
              {changeState.message}
            </p>
          ) : null}
          {changeState.status === "success" && changeState.message ? (
            <p role="status" className="text-sm leading-6 text-emerald-700">
              {changeState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={changePending}
            className="button-primary px-6 py-3 disabled:cursor-wait disabled:opacity-65"
          >
            {changePending ? "Bezig…" : "Wijziging versturen"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
