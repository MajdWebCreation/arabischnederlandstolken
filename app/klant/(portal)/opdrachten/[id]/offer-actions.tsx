"use client";

import { useState } from "react";
import Link from "next/link";
import { PortalActionForm } from "@/components/portal/portal-action-form";
import { acceptBookingOffer, requestBookingChange } from "@/app/klant/(portal)/opdrachten/[id]/actions";
import { TERMS_PATH } from "@/lib/legal/terms";

/**
 * "Opdrachtvoorstel" acceptance (Phase 4 brief section 12): [Akkoord] /
 * [Wijziging aanvragen]. Terms acceptance is a real, explicit statement
 * next to the accept action itself, not something implied by a footer link
 * (section 13) - and the consumer early-performance consent checkboxes
 * (section 15) only render when the server has determined they are legally
 * relevant for this specific booking; the database still enforces this
 * independently (see customer_accept_booking_offer()), so this UI gate is
 * a convenience, not the actual guarantee.
 */
export function OfferActions({
  bookingId,
  requiresEarlyPerformanceConsent,
}: {
  bookingId: string;
  requiresEarlyPerformanceConsent: boolean;
}) {
  const [showChangeForm, setShowChangeForm] = useState(false);

  return (
    <div className="space-y-4">
      <PortalActionForm
        action={acceptBookingOffer.bind(null, bookingId)}
        submitLabel="Akkoord"
        submitClassName="button-primary w-full px-5 py-3.5 text-base disabled:cursor-wait disabled:opacity-65"
      >
        <div className="space-y-3">
          {requiresEarlyPerformanceConsent ? (
            <>
              <label className="flex items-start gap-2.5 rounded-xl border border-line px-3.5 py-3 text-sm leading-6 has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
                <input
                  type="checkbox"
                  name="earlyPerformanceConsent"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong"
                />
                Ik verzoek Arabisch Nederlands Tolken om de dienstverlening
                binnen de wettelijke bedenktijd te laten beginnen.
              </label>
              <label className="flex items-start gap-2.5 rounded-xl border border-line px-3.5 py-3 text-sm leading-6 has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
                <input
                  type="checkbox"
                  name="earlyPerformanceFullCompletionAck"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong"
                />
                Ik erken dat ik mijn herroepingsrecht verlies zodra de dienst
                volledig is uitgevoerd.
              </label>
            </>
          ) : null}

          <label className="flex items-start gap-2.5 rounded-xl border border-line px-3.5 py-3 text-sm leading-6 has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
            <input
              type="checkbox"
              name="termsAccepted"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line-strong"
            />
            Ik ga akkoord met de opdracht en heb kennisgenomen van de{" "}
            <Link href={TERMS_PATH} target="_blank" className="font-semibold underline">
              Algemene Voorwaarden
            </Link>
            .
          </label>
        </div>
      </PortalActionForm>

      {showChangeForm ? (
        <PortalActionForm
          action={requestBookingChange.bind(null, bookingId)}
          submitLabel="Wijziging versturen"
          submitClassName="button-secondary w-full px-5 py-3 disabled:cursor-wait disabled:opacity-65"
        >
          <label htmlFor="message" className="text-sm font-semibold text-foreground">
            Welke wijziging wilt u aanvragen?
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            required
            className="form-control mt-1.5"
          />
        </PortalActionForm>
      ) : (
        <button
          type="button"
          onClick={() => setShowChangeForm(true)}
          className="button-tertiary w-full px-5 py-3"
        >
          Wijziging aanvragen
        </button>
      )}
    </div>
  );
}
