import { Route, Bus, Calendar, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";

export default function Dashboard() {
  const { profile, tenantId } = useAuth();

  // Fetch counts for this tenant only
  const { data: routes = [] } = useSupabaseQuery({
    table: "routes",
    queryKey: ["routes-count", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { data: buses = [] } = useSupabaseQuery({
    table: "buses",
    queryKey: ["buses-count", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { data: schedules = [] } = useSupabaseQuery({
    table: "schedules",
    queryKey: ["schedules-count", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { data: bookings = [] } = useSupabaseQuery({
    table: "bookings",
    queryKey: ["bookings-count", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const stats = [
    {
      title: "Total Routes",
      value: routes.length,
      icon: Route,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Buses",
      value: buses.length,
      icon: Bus,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Active Schedules",
      value: schedules.filter((s) => s.status === "scheduled").length,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Ticket,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome back, {profile?.full_name || "Operator"} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your bus operations today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Seat {booking.seat_number}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  EGP {booking.total_price}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
