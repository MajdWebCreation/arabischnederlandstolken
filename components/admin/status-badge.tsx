import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/lib/bookings/constants";

const statusStyles: Record<BookingStatus, string> = {
  new: "bg-amber-100 text-amber-900 border-amber-300",
  interpreter_search: "bg-amber-100 text-amber-900 border-amber-300",
  quoted: "bg-sky-100 text-sky-900 border-sky-300",
  customer_accepted: "bg-sky-100 text-sky-900 border-sky-300",
  interpreter_confirmed: "bg-blue-100 text-blue-900 border-blue-300",
  confirmed: "bg-blue-100 text-blue-900 border-blue-300",
  completed: "bg-teal-100 text-teal-900 border-teal-300",
  cancelled: "bg-gray-200 text-gray-700 border-gray-300",
  customer_invoiced: "bg-violet-100 text-violet-900 border-violet-300",
  paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
};

export function StatusBadge({ status }: { status: string }) {
  const knownStatus = status as BookingStatus;
  const style = statusStyles[knownStatus] ?? "bg-gray-100 text-gray-800 border-gray-300";
  const label = BOOKING_STATUS_LABELS[knownStatus] ?? status;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
