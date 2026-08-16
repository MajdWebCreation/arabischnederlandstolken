"use client";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { addInterpreterLanguage } from "@/app/admin/(dashboard)/interpreters/actions";

export function AddLanguageForm({ interpreterId }: { interpreterId: string }) {
  const action = addInterpreterLanguage.bind(null, interpreterId);

  return (
    <AdminActionForm action={action} submitLabel="Toevoegen" className="mt-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_1.4fr]">
        <div>
          <label htmlFor="languageFrom" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Van
          </label>
          <input
            id="languageFrom"
            name="languageFrom"
            type="text"
            required
            placeholder="ar"
            dir="ltr"
            className="form-control mt-1.5"
          />
        </div>
        <div>
          <label htmlFor="languageTo" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Naar
          </label>
          <input
            id="languageTo"
            name="languageTo"
            type="text"
            required
            placeholder="nl"
            dir="ltr"
            className="form-control mt-1.5"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="swornForCombination"
              className="h-4 w-4 rounded border-line-strong"
            />
            Beëdigd
          </label>
        </div>
        <div>
          <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Notitie (optioneel)
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            className="form-control mt-1.5"
          />
        </div>
      </div>
    </AdminActionForm>
  );
}
