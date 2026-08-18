"use client";

import { useState } from "react";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import {
  requestCancellation,
  withdrawPendingRequest,
} from "@/app/klant/(portal)/opdrachten/[id]/actions";

const WITHDRAWABLE_STATUSES = ["new", "interpreter_search", "quoted", "customer_accepted"];
const CANCELLABLE_STATUSES = ["interpreter_confirmed", "confirmed"];
const WITHDRAWAL_RIGHT_STATUSES = ["customer_accepted", "interpreter_confirmed", "confirmed"];

/**
 * Phase 4 brief sections 24-25: a not-yet-confirmed request can be
 * withdrawn immediately ("Aanvraag intrekken"), while a confirmed booking
 * only ever gets "Annulering aanvragen" - never an "Annuleer direct"
 * button - with an explicit warning that this is a request, not an
 * immediate/settled cancellation, and that costs may apply. The statutory
 * consumer withdrawal right (article 17/18) is shown as a clearly separate
 * action for individual customers, never merged into the same button.
 */
export function CancellationActions({
  bookingId,
  bookingStatus,
  customerType,
  hasAcceptedContract,
  hasPendingCancellationRequest,
  pendingRequestIsWithdrawal,
}: {
  bookingId: string;
  bookingStatus: string;
  customerType: string;
  hasAcceptedContract: boolean;
  hasPendingCancellationRequest: boolean;
  pendingRequestIsWithdrawal: boolean;
}) {
  const [openAction, setOpenAction] = useState<"withdraw" | "cancel" | "consumer_withdrawal" | null>(null);

  if (hasPendingCancellationRequest) {
    return (
      <p className="panel-soft px-4 py-4 text-sm leading-6 text-muted">
        {pendingRequestIsWithdrawal
          ? "Uw beroep op het herroepingsrecht is in behandeling bij Arabisch Nederlands Tolken."
          : "Uw annuleringsverzoek is in behandeling bij Arabisch Nederlands Tolken."}
      </p>
    );
  }

  const canWithdraw = WITHDRAWABLE_STATUSES.includes(bookingStatus);
  const canCancel = CANCELLABLE_STATUSES.includes(bookingStatus);
  const canUseWithdrawalRight =
    customerType === "individual" && hasAcceptedContract && WITHDRAWAL_RIGHT_STATUSES.includes(bookingStatus);

  if (!canWithdraw && !canCancel) {
    return null;
  }

  return (
    <div className="space-y-3">
      {canWithdraw ? (
        openAction === "withdraw" ? (
          <div className="rounded-2xl border border-line px-4 py-4">
            <p className="text-sm leading-6 text-muted">
              Uw aanvraag is nog niet definitief bevestigd en kan direct worden
              ingetrokken.
            </p>
            <PortalActionForm
              action={withdrawPendingRequest.bind(null, bookingId)}
              submitLabel="Aanvraag definitief intrekken"
              submitClassName="button-primary mt-3 w-full px-5 py-3 disabled:cursor-wait disabled:opacity-65"
            >
              <label htmlFor="withdraw-reason" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Reden (optioneel)
              </label>
              <textarea id="withdraw-reason" name="reason" rows={2} className="form-control mt-1.5" />
            </PortalActionForm>
          </div>
        ) : (
          <button type="button" onClick={() => setOpenAction("withdraw")} className="button-secondary w-full px-5 py-3">
            Aanvraag intrekken
          </button>
        )
      ) : null}

      {canCancel ? (
        openAction === "cancel" ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4">
            <p className="text-sm leading-6 text-amber-900">
              Annulering is onderworpen aan de opdrachtovereenkomst en de
              Algemene Voorwaarden. Afhankelijk van de opdracht kunnen
              annuleringskosten van toepassing zijn. Dit verzoek wordt door
              Arabisch Nederlands Tolken beoordeeld en is niet automatisch
              financieel afgewikkeld.
            </p>
            <PortalActionForm
              action={requestCancellation.bind(null, bookingId, "cancellation")}
              submitLabel="Annulering aanvragen"
              submitClassName="button-primary mt-3 w-full px-5 py-3 disabled:cursor-wait disabled:opacity-65"
            >
              <label htmlFor="cancel-reason" className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                Reden (optioneel)
              </label>
              <textarea id="cancel-reason" name="reason" rows={2} className="form-control mt-1.5" />
            </PortalActionForm>
          </div>
        ) : (
          <button type="button" onClick={() => setOpenAction("cancel")} className="button-secondary w-full px-5 py-3">
            Annulering aanvragen
          </button>
        )
      ) : null}

      {canUseWithdrawalRight ? (
        openAction === "consumer_withdrawal" ? (
          <div className="rounded-2xl border border-line px-4 py-4">
            <p className="text-sm leading-6 text-muted">
              Als consument heeft u onder voorwaarden het wettelijke recht om
              deze overeenkomst binnen de bedenktijd te herroepen (zie de
              Algemene Voorwaarden, artikel 17-18).
            </p>
            <PortalActionForm
              action={requestCancellation.bind(null, bookingId, "consumer_withdrawal")}
              submitLabel="Beroep doen op herroepingsrecht"
              submitClassName="button-secondary mt-3 w-full px-5 py-3 disabled:cursor-wait disabled:opacity-65"
            >
              <label htmlFor="withdrawal-reason" className="text-xs font-semibold uppercase tracking-wide text-muted">
                Toelichting (optioneel)
              </label>
              <textarea id="withdrawal-reason" name="reason" rows={2} className="form-control mt-1.5" />
            </PortalActionForm>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpenAction("consumer_withdrawal")}
            className="text-center text-xs font-semibold text-muted underline decoration-line underline-offset-4"
          >
            Beroep doen op het herroepingsrecht
          </button>
        )
      ) : null}
    </div>
  );
}
