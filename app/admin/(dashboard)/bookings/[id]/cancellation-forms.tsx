"use client";

import { useState } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import { reviewCancellationRequest } from "@/app/admin/(dashboard)/bookings/[id]/actions";
import {
  CANCELLATION_REQUEST_STATUS_LABELS,
  CANCELLATION_REQUEST_TYPE_LABELS,
  type CancellationRequestStatus,
  type CancellationRequestType,
} from "@/lib/cancellation/constants";
import { UNAVAILABILITY_REPORT_STATUS_LABELS } from "@/lib/cancellation/constants";
import type { CancellationRequestRow, UnavailabilityReportRow } from "@/lib/cancellation/queries";
import { formatNumberAsCurrency } from "@/lib/money";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReviewForm({ bookingId, request }: { bookingId: string; request: CancellationRequestRow }) {
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");

  return (
    <AdminActionForm
      action={reviewCancellationRequest.bind(null, bookingId, request.id)}
      submitLabel="Beslissing opslaan"
      className="mt-3 rounded-xl border border-line bg-surface-alt/60 px-4 py-4"
    >
      <div className="flex gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="decision"
            value="approved"
            checked={decision === "approved"}
            onChange={() => setDecision("approved")}
          />
          Goedkeuren
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="decision"
            value="rejected"
            checked={decision === "rejected"}
            onChange={() => setDecision("rejected")}
          />
          Afwijzen
        </label>
      </div>

      {decision === "approved" ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`charge-${request.id}`} className="text-xs font-semibold uppercase tracking-wide text-muted">
              Annuleringskosten (excl. btw)
            </label>
            <input
              id={`charge-${request.id}`}
              name="chargeAmountExVat"
              type="text"
              inputMode="decimal"
              placeholder="Leeg = geen bedrag"
              className="form-control mt-1.5"
            />
          </div>
          <label className="mt-6 flex items-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
            <input type="checkbox" name="chargeWaived" className="h-4 w-4 rounded border-line-strong" />
            Kosten kwijtgescholden
          </label>
        </div>
      ) : null}

      <div className="mt-3">
        <label htmlFor={`note-${request.id}`} className="text-xs font-semibold uppercase tracking-wide text-muted">
          Interne notitie (optioneel)
        </label>
        <textarea id={`note-${request.id}`} name="adminDecisionNote" rows={2} className="form-control mt-1.5" />
      </div>
    </AdminActionForm>
  );
}

export function CancellationRequestsSection({
  bookingId,
  requests,
}: {
  bookingId: string;
  requests: CancellationRequestRow[];
}) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted">Geen annulerings-/herroepingsverzoeken.</p>;
  }

  return (
    <ul className="space-y-4">
      {requests.map((request) => {
        const status = request.status as CancellationRequestStatus;
        const type = request.request_type as CancellationRequestType;

        return (
          <li key={request.id} className="rounded-2xl border border-line px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {CANCELLATION_REQUEST_TYPE_LABELS[type] ?? request.request_type}
              </span>
              <span className="chip">{CANCELLATION_REQUEST_STATUS_LABELS[status] ?? request.status}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Aangevraagd op {formatDateTime(request.requested_at)}</p>
            {request.reason ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{request.reason}</p>
            ) : null}

            {request.status !== "pending" ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                {request.charge_waived ? (
                  <div className="col-span-2">Kosten kwijtgescholden.</div>
                ) : request.charge_amount_ex_vat !== null ? (
                  <div className="col-span-2">
                    Annuleringskosten: {formatNumberAsCurrency(request.charge_amount_ex_vat)}
                  </div>
                ) : null}
                {request.admin_decision_note ? (
                  <div className="col-span-2">Notitie: {request.admin_decision_note}</div>
                ) : null}
              </dl>
            ) : (
              <ReviewForm bookingId={bookingId} request={request} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function UnavailabilityReportsSection({ reports }: { reports: UnavailabilityReportRow[] }) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">Verhindering tolk</h2>
      <ul className="mt-3 space-y-3">
        {reports.map((report) => (
          <li
            key={report.id}
            className={`rounded-2xl border px-4 py-4 ${
              report.status === "open" ? "border-amber-300 bg-amber-50" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${report.status === "open" ? "text-amber-900" : "text-foreground"}`}>
                {UNAVAILABILITY_REPORT_STATUS_LABELS[report.status] ?? report.status}
              </span>
              <span className="text-xs text-muted">{formatDateTime(report.reported_at)}</span>
            </div>
            {report.reason ? (
              <p className="mt-2 text-sm leading-6 text-foreground">{report.reason}</p>
            ) : null}
            {report.status === "open" ? (
              <p className="mt-2 text-xs text-amber-900">
                Wijs hieronder een vervangende tolk toe via &ldquo;Tolktoewijzing (snel, direct)&rdquo;.
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
