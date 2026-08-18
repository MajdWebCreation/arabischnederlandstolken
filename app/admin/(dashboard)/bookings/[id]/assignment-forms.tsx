"use client";

import { useState } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  inviteInterpreterToBooking,
  publishOpenAssignment,
  selectInterpreterForBooking,
  withdrawAssignment,
} from "@/app/admin/(dashboard)/bookings/[id]/actions";
import type { InterpreterMatch } from "@/lib/interpreters/matching";
import type { BookingAssignmentRow } from "@/lib/assignments/queries";
import {
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  OPEN_ASSIGNMENT_STATUSES,
  type AssignmentStatus,
} from "@/lib/assignments/constants";
import { formatNumberAsCurrency } from "@/lib/money";
import type { SchedulingConflict } from "@/lib/interpreters/matching";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

function InviteInterpreterForm({
  bookingId,
  interpreterId,
}: {
  bookingId: string;
  interpreterId: string;
}) {
  const action = inviteInterpreterToBooking.bind(null, bookingId);

  return (
    <AdminActionForm action={action} submitLabel="Uitnodiging versturen" className="mt-4">
      <input type="hidden" name="interpreterId" value={interpreterId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={fieldLabel}>Vergoeding excl. btw</label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              name="offeredCompensationExVat"
              type="text"
              inputMode="decimal"
              required
              placeholder="180"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Reiskostenvergoeding excl. btw</label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              name="offeredTravelCompensationExVat"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Reactietermijn (optioneel)</label>
          <input
            name="expiresAt"
            type="datetime-local"
            className="form-control mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabel}>Bericht aan tolk (optioneel)</label>
          <textarea
            name="messageToInterpreter"
            rows={2}
            className="form-control mt-1.5 resize-y"
          />
        </div>
      </div>
    </AdminActionForm>
  );
}

export function SuitableInterpretersSection({
  bookingId,
  matches,
}: {
  bookingId: string;
  matches: InterpreterMatch[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted">
        Geen actieve tolken met deze taalcombinatie gevonden.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {matches.map((match) => (
        <li key={match.interpreter.id} className="rounded-xl border border-line p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">
                {match.interpreter.first_name} {match.interpreter.last_name}
                {match.interpreter.city ? (
                  <span className="ms-2 text-sm font-normal text-muted">
                    {match.interpreter.city}
                  </span>
                ) : null}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {match.reasons.map((reason) => (
                  <li
                    key={reason.key}
                    className={
                      reason.met
                        ? "text-emerald-700"
                        : reason.hardGate
                          ? "font-semibold text-red-700"
                          : "text-muted"
                    }
                  >
                    {reason.met ? "✓" : "✕"} {reason.label}
                  </li>
                ))}
              </ul>
            </div>
            {match.eligible ? (
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === match.interpreter.id ? null : match.interpreter.id)
                }
                className="button-secondary px-4 py-2 text-sm"
              >
                {expandedId === match.interpreter.id ? "Annuleren" : "Uitnodigen"}
              </button>
            ) : (
              <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                Niet geschikt
              </span>
            )}
          </div>
          {expandedId === match.interpreter.id ? (
            <InviteInterpreterForm bookingId={bookingId} interpreterId={match.interpreter.id} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function PublishOpenAssignmentForm({ bookingId }: { bookingId: string }) {
  const action = publishOpenAssignment.bind(null, bookingId);

  return (
    <AdminActionForm action={action} submitLabel="Publiceren naar geschikte tolken">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={fieldLabel}>Vergoeding excl. btw</label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              name="offeredCompensationExVat"
              type="text"
              inputMode="decimal"
              required
              placeholder="180"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Reiskostenvergoeding excl. btw</label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted">€</span>
            <input
              name="offeredTravelCompensationExVat"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              className="form-control"
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Reactietermijn (optioneel)</label>
          <input name="expiresAt" type="datetime-local" className="form-control mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabel}>
            Korte omschrijving voor tolken (optioneel)
          </label>
          <textarea name="description" rows={2} className="form-control mt-1.5 resize-y" />
        </div>
      </div>
    </AdminActionForm>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CandidatesTable({
  bookingId,
  assignments,
  conflictsByAssignmentId,
}: {
  bookingId: string;
  assignments: BookingAssignmentRow[];
  conflictsByAssignmentId: Record<string, SchedulingConflict[]>;
}) {
  if (assignments.length === 0) {
    return <p className="text-sm text-muted">Nog geen kandidaten uitgenodigd.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-alt text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5">Tolk</th>
            <th className="px-3 py-2.5">Type</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5 text-right">Vergoeding</th>
            <th className="px-3 py-2.5">Uitgenodigd</th>
            <th className="px-3 py-2.5">Gereageerd</th>
            <th className="px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const conflicts = conflictsByAssignmentId[assignment.id] ?? [];
            const canWithdraw = OPEN_ASSIGNMENT_STATUSES.includes(
              assignment.status as AssignmentStatus,
            );

            return (
              <tr key={assignment.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5">
                  <div className="font-medium text-foreground">
                    {assignment.interpreter
                      ? `${assignment.interpreter.first_name} ${assignment.interpreter.last_name}`
                      : "Onbekend"}
                  </div>
                  {conflicts.length > 0 ? (
                    <p className="mt-1 text-xs font-semibold text-amber-800">
                      ⚠ Botsing met {conflicts.map((c) => c.bookingNumber).join(", ")}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-muted">
                  {ASSIGNMENT_TYPE_LABELS[assignment.assignment_type as "open" | "direct"] ??
                    assignment.assignment_type}
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted-strong">
                    {ASSIGNMENT_STATUS_LABELS[assignment.status as AssignmentStatus] ??
                      assignment.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {formatNumberAsCurrency(assignment.offered_compensation_ex_vat)}
                  {assignment.offered_travel_compensation_ex_vat ? (
                    <div className="text-xs text-muted">
                      + {formatNumberAsCurrency(assignment.offered_travel_compensation_ex_vat)} reis
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-muted">{formatDateTime(assignment.invited_at)}</td>
                <td className="px-3 py-2.5 text-muted">
                  {formatDateTime(assignment.responded_at)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap justify-end gap-2">
                    {assignment.status === "interested" ||
                    assignment.status === "invited" ||
                    assignment.status === "viewed" ? (
                      <form action={selectInterpreterForBooking.bind(null, bookingId, assignment.id)}>
                        <button
                          type="submit"
                          className="rounded-full bg-brand-strong px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Selecteren
                        </button>
                      </form>
                    ) : null}
                    {canWithdraw ? (
                      <form action={withdrawAssignment.bind(null, bookingId, assignment.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted-strong hover:border-red-300 hover:text-red-700"
                        >
                          Intrekken
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
