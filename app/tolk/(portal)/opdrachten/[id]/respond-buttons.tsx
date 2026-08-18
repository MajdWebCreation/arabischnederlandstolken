"use client";

import { useEffect, useState } from "react";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import {
  markAssignmentViewed,
  reportUnavailable,
  respondToAssignment,
} from "@/app/tolk/(portal)/opdrachten/[id]/actions";

export function MarkViewedOnMount({ assignmentId }: { assignmentId: string }) {
  useEffect(() => {
    markAssignmentViewed(assignmentId);
    // Fire once per page view - re-running on every render would just be a
    // series of harmless no-ops (see the action's own comment), but once is
    // all that is needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function RespondButtons({ assignmentId }: { assignmentId: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <PortalActionForm
        action={respondToAssignment.bind(null, assignmentId, "interested")}
        submitLabel="Interesse tonen"
        submitClassName="button-primary w-full px-5 py-3.5 text-base disabled:cursor-wait disabled:opacity-65"
      >
        {null}
      </PortalActionForm>
      <PortalActionForm
        action={respondToAssignment.bind(null, assignmentId, "declined")}
        submitLabel="Afwijzen"
        submitClassName="button-secondary w-full px-5 py-3.5 text-base disabled:cursor-wait disabled:opacity-65"
      >
        {null}
      </PortalActionForm>
    </div>
  );
}

/**
 * "Ik ben verhinderd" on a confirmed booking (Phase 4 brief section 27).
 * Deliberately understated in the UI (a plain text-link toggle, not a
 * prominent button) - this is an exceptional action, not a routine one.
 */
export function ReportUnavailableButton({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs font-semibold text-muted underline decoration-line underline-offset-4"
      >
        Ik ben verhinderd voor deze opdracht
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4">
      <p className="text-sm leading-6 text-amber-900">
        Dit annuleert de opdracht van de klant niet direct - de beheerder
        wordt gewaarschuwd en zoekt een vervanger.
      </p>
      <PortalActionForm
        action={reportUnavailable.bind(null, bookingId)}
        submitLabel="Verhindering melden"
        submitClassName="button-primary mt-3 w-full px-5 py-3 disabled:cursor-wait disabled:opacity-65"
      >
        <label htmlFor="unavailable-reason" className="text-xs font-semibold uppercase tracking-wide text-amber-900">
          Reden (optioneel)
        </label>
        <textarea id="unavailable-reason" name="reason" rows={2} className="form-control mt-1.5" />
      </PortalActionForm>
    </div>
  );
}
