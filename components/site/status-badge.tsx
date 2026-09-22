import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  completed: "bg-slate-200 text-slate-700 hover:bg-slate-200",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge className={STYLES[status]}>{status}</Badge>;
}
