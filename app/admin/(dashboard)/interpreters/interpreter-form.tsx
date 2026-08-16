"use client";

import { AdminActionForm, type FormActionState } from "@/components/admin/admin-action-form";
import type { InterpreterRow } from "@/lib/interpreters/queries";

const fieldLabel = "text-xs font-semibold uppercase tracking-wide text-muted";

type InterpreterFormProps = {
  action: (
    previousState: FormActionState,
    formData: FormData,
  ) => Promise<FormActionState>;
  interpreter?: InterpreterRow;
  submitLabel: string;
};

export function InterpreterForm({
  action,
  interpreter,
  submitLabel,
}: InterpreterFormProps) {
  return (
    <AdminActionForm action={action} submitLabel={submitLabel}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={fieldLabel}>
            Voornaam
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            defaultValue={interpreter?.first_name ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="lastName" className={fieldLabel}>
            Achternaam
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            defaultValue={interpreter?.last_name ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            E-mailadres
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            dir="ltr"
            defaultValue={interpreter?.email ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="phone" className={fieldLabel}>
            Telefoon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            defaultValue={interpreter?.phone ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="city" className={fieldLabel}>
            Stad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={interpreter?.city ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={interpreter ? interpreter.active : true}
              className="h-4 w-4 rounded border-line-strong"
            />
            Actief
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="swornInterpreter"
              defaultChecked={interpreter?.sworn_interpreter ?? false}
              className="h-4 w-4 rounded border-line-strong"
            />
            Beëdigd tolk
          </label>
        </div>
        <div>
          <label htmlFor="rbtvNumber" className={fieldLabel}>
            Rbtv-nummer
          </label>
          <input
            id="rbtvNumber"
            name="rbtvNumber"
            type="text"
            dir="ltr"
            defaultValue={interpreter?.rbtv_number ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="rbtvExpiryDate" className={fieldLabel}>
            Rbtv geldig tot
          </label>
          <input
            id="rbtvExpiryDate"
            name="rbtvExpiryDate"
            type="date"
            defaultValue={interpreter?.rbtv_expiry_date ?? ""}
            className="form-control mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="internalNotes" className={fieldLabel}>
            Interne notities
          </label>
          <textarea
            id="internalNotes"
            name="internalNotes"
            rows={4}
            defaultValue={interpreter?.internal_notes ?? ""}
            className="form-control mt-1.5 resize-y"
          />
        </div>
      </div>
    </AdminActionForm>
  );
}
