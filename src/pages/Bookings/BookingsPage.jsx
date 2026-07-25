// bus-dashboard/src/pages/bookings/BookingsPage.jsx
import { useState } from "react";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import { useSupabaseMutate } from "../../hooks/useSupabaseMutate";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Armchair,
  X,
  Search,
  Phone,
  Smartphone,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export default function BookingsPage() {
  const [filter, setFilter] = useState("pending"); // 'all' | 'pending' | 'confirmed' | 'cancelled'
  const [search, setSearch] = useState("");

  const { data: bookings = [], isLoading } = useSupabaseQuery({
    table: "bookings",
    queryKey: ["bookings", filter],
    select: "*, schedules(*, routes(*), buses(*)), pickup_points(name)",
    orderBy: { column: "created_at", asc: false },
    ...(filter !== "all" ? { filters: { status: filter } } : {}),
    enabled: true,
  });

  const { mutate: updateBooking, isPending: isConfirming } = useSupabaseMutate({
    table: "bookings",
    method: "update",
    queryKeysToInvalidate: [
      ["bookings", filter],
      ["bookings", "all"],
    ],
  });

  const handleConfirm = (id) => {
    updateBooking({
      id,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    });
  };

  const handleCancel = (id) => {
    updateBooking({ id, status: "cancelled" });
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.passenger_name?.toLowerCase().includes(q) ||
      b.passenger_phone?.includes(q) ||
      b.vf_cash_phone?.includes(q) ||
      b.schedules?.routes?.from_city?.toLowerCase().includes(q) ||
      b.schedules?.routes?.to_city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and confirm bookings
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {["all", "pending", "confirmed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search passenger or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Armchair className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Passenger
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Route
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Pickup Point
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Seat
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Amount
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  VF Cash Phone
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Date
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((booking) => {
                const s = booking.schedules;
                const status =
                  STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {booking.passenger_name || "—"}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {booking.passenger_phone || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {s?.routes?.from_city} → {s?.routes?.to_city}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {s?.departure_time ? formatTime(s.departure_time) : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {booking.pickup_points?.name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-lg text-gray-700">
                        <Armchair className="w-3.5 h-3.5" />
                        {booking.seat_number}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {Number(booking.total_price).toLocaleString()} EGP
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                        {booking.vf_cash_phone || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {booking.payment_submitted_at
                        ? formatDate(booking.payment_submitted_at)
                        : formatDate(booking.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {booking.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            disabled={isConfirming}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Confirm
                          </button>
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={isConfirming}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
