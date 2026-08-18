"use client";

import { useActionState } from "react";
import {
  addInterpreterInvoiceItem,
  updateInterpreterInvoiceItem,
  deleteInterpreterInvoiceItem,
} from "@/app/admin/(dashboard)/interpreter-invoices/[id]/actions";
import { initialFormActionState } from "@/components/admin/admin-action-form";
import type { InterpreterInvoiceItemRow } from "@/lib/interpreter-invoices/queries";
import { centsToInputValue } from "@/lib/money";

function fieldClass() {
  return "form-control";
}

export function InterpreterItemEditRow({
  item,
  invoiceId,
  bookingId,
}: {
  item: InterpreterInvoiceItemRow;
  invoiceId: string;
  bookingId: string;
}) {
  const boundUpdate = updateInterpreterInvoiceItem.bind(null, item.id, invoiceId, bookingId);
  const [state, formAction, pending] = useActionState(boundUpdate, initialFormActionState);
  const boundDelete = deleteInterpreterInvoiceItem.bind(null, item.id, invoiceId, bookingId);

  return (
    <div className="rounded-xl border border-line px-3 py-3">
      <form action={formAction} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Omschrijving
          </label>
          <input
            name="description"
            defaultValue={item.description}
            required
            className={`${fieldClass()} mt-1`}
          />
        </div>
        <div className="w-20">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Aantal</label>
          <input
            name="quantity"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={Number(item.quantity)}
            required
            className={`${fieldClass()} mt-1`}
          />
        </div>
        <div className="w-24">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Eenheid</label>
          <input
            name="unit"
            defaultValue={item.unit ?? ""}
            placeholder="uur, vast, km"
            className={`${fieldClass()} mt-1`}
          />
        </div>
        <div className="w-28">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Prijs excl. btw
          </label>
          <input
            name="unitPriceExVat"
            type="text"
            inputMode="decimal"
            defaultValue={centsToInputValue(Math.round(item.unit_price_ex_vat * 100))}
            required
            dir="ltr"
            className={`${fieldClass()} mt-1`}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="button-secondary px-4 py-2.5 text-sm disabled:cursor-wait disabled:opacity-65"
        >
          {pending ? "Bezig…" : "Opslaan"}
        </button>
        <button
          type="submit"
          formAction={boundDelete}
          className="rounded-full px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Verwijderen
        </button>
      </form>
      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

export function AddInterpreterItemForm({
  invoiceId,
  bookingId,
}: {
  invoiceId: string;
  bookingId: string;
}) {
  const boundAdd = addInterpreterInvoiceItem.bind(null, invoiceId, bookingId);
  const [state, formAction, pending] = useActionState(boundAdd, initialFormActionState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-line-strong px-3 py-3"
    >
      <div className="min-w-[200px] flex-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Omschrijving
        </label>
        <input name="description" required className={`${fieldClass()} mt-1`} placeholder="Nieuwe regel" />
      </div>
      <div className="w-20">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Aantal</label>
        <input
          name="quantity"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={1}
          required
          className={`${fieldClass()} mt-1`}
        />
      </div>
      <div className="w-24">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Eenheid</label>
        <input name="unit" placeholder="uur, vast, km" className={`${fieldClass()} mt-1`} />
      </div>
      <div className="w-28">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          Prijs excl. btw
        </label>
        <input
          name="unitPriceExVat"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          required
          dir="ltr"
          className={`${fieldClass()} mt-1`}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="button-primary px-4 py-2.5 text-sm disabled:cursor-wait disabled:opacity-65"
      >
        {pending ? "Bezig…" : "Regel toevoegen"}
      </button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="w-full text-xs text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
