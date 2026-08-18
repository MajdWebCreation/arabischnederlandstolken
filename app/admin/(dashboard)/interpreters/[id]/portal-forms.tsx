"use client";

import { useTransition } from "react";
import { AdminActionForm } from "@/components/admin/admin-action-form";
import {
  linkInterpreterAccount,
  toggleInterpreterCapability,
  unlinkInterpreterAccount,
} from "@/app/admin/(dashboard)/interpreters/actions";
import type { InterpreterRow } from "@/lib/interpreters/queries";
import type { CapabilityTagRow, InterpreterCapabilityRow } from "@/lib/interpreters/matching";

export function PortalAccountSection({ interpreter }: { interpreter: InterpreterRow }) {
  if (interpreter.user_id) {
    return (
      <div>
        <p className="text-sm text-foreground">
          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
            Gekoppeld
          </span>
        </p>
        <p className="mt-2 text-sm text-muted">
          Gekoppeld account: <span className="text-foreground">{interpreter.email}</span>
        </p>
        <form action={unlinkInterpreterAccount.bind(null, interpreter.id)} className="mt-3">
          <button type="submit" className="button-secondary px-4 py-2 text-sm">
            Ontkoppelen
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground">
        <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
          Niet gekoppeld
        </span>
      </p>
      <p className="mt-2 text-xs text-muted">
        Maak eerst een account aan via Supabase Dashboard &gt; Authentication
        &gt; Users (met dit e-mailadres), en koppel dat account daarna hier.
      </p>
      <AdminActionForm
        action={linkInterpreterAccount.bind(null, interpreter.id)}
        submitLabel="Koppelen"
        className="mt-3"
      >
        <label htmlFor="link-email" className="text-xs font-semibold uppercase tracking-wide text-muted">
          E-mailadres van het account
        </label>
        <input
          id="link-email"
          name="email"
          type="email"
          dir="ltr"
          defaultValue={interpreter.email}
          required
          className="form-control mt-1.5"
        />
      </AdminActionForm>
    </div>
  );
}

function CapabilityCheckbox({
  interpreterId,
  tag,
  checked,
}: {
  interpreterId: string;
  tag: CapabilityTagRow;
  checked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm has-[:checked]:border-brand/50 has-[:checked]:bg-brand-soft/40">
      <input
        type="checkbox"
        defaultChecked={checked}
        disabled={isPending}
        className="h-4 w-4 rounded border-line-strong"
        onChange={(event) => {
          const next = event.target.checked;
          startTransition(async () => {
            await toggleInterpreterCapability(interpreterId, tag.id, next);
          });
        }}
      />
      {tag.label}
    </label>
  );
}

export function CapabilitiesSection({
  interpreterId,
  allTags,
  assigned,
}: {
  interpreterId: string;
  allTags: CapabilityTagRow[];
  assigned: InterpreterCapabilityRow[];
}) {
  const assignedIds = new Set(assigned.map((row) => row.capability_tag_id));
  const dialects = allTags.filter((tag) => tag.category === "dialect" && tag.active);
  const specialties = allTags.filter((tag) => tag.category === "specialty" && tag.active);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Dialecten</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {dialects.map((tag) => (
            <CapabilityCheckbox
              key={tag.id}
              interpreterId={interpreterId}
              tag={tag}
              checked={assignedIds.has(tag.id)}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Specialisaties</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {specialties.map((tag) => (
            <CapabilityCheckbox
              key={tag.id}
              interpreterId={interpreterId}
              tag={tag}
              checked={assignedIds.has(tag.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
