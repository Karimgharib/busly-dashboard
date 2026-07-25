// bus-dashboard/src/pages/schedules/SchedulesPage.jsx
import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import { useSupabaseMutate } from "../../hooks/useSupabaseMutate";
import supabase from "../../lib/supabase";
import AddScheduleModal from "./components/AddScheduleModal";
import EditScheduleModal from "./components/EditScheduleModal";

export default function SchedulesPage() {
  const { tenantId, tenant } = useAuth();
  const primaryColor = tenant?.primary_color || "#2563eb";
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { data: schedules = [], isLoading } = useSupabaseQuery({
    table: "schedules",
    queryKey: ["schedules", tenantId],
    select:
      "id, departure_time, arrival_time, price, available_seats, status, route_id, bus_id, routes(from_city, to_city), buses(name)",
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { mutate: updateSchedule, isPending: isUpdating } = useSupabaseMutate({
    table: "schedules",
    method: "update",
    queryKeysToInvalidate: [["schedules", tenantId]],
    onSuccess: () => setEditingSchedule(null),
  });

  const { mutate: deleteSchedule } = useSupabaseMutate({
    table: "schedules",
    method: "delete",
    queryKeysToInvalidate: [["schedules", tenantId]],
  });

  // Direct Supabase call — bypasses React Query mutation serialization
  async function handleAdd(schedulesArray) {
    console.log(
      "handleAdd called",
      JSON.stringify(schedulesArray).slice(0, 100),
    );

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from("schedules")
        .insert(schedulesArray)
        .select();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["schedules", tenantId] });
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add schedules:", err);
    } finally {
      setIsAdding(false);
    }
  }

  function formatDateTime(isoString) {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadge(status) {
    const styles = {
      active: "bg-blue-50 text-blue-600",
      departed: "bg-amber-50 text-amber-600",
      completed: "bg-green-50 text-green-600",
      cancelled: "bg-red-50 text-red-600",
    };
    return styles[status] || "bg-gray-50 text-gray-600";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Schedules</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage departure and arrival times
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No schedules yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Bus</th>
                  <th className="px-6 py-3">Departure</th>
                  <th className="px-6 py-3">Arrival</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Seats</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {schedule.routes
                        ? `${schedule.routes.from_city} → ${schedule.routes.to_city}`
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {schedule.buses?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(schedule.departure_time)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(schedule.arrival_time)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      EGP {schedule.price}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {schedule.available_seats}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusBadge(schedule.status)}`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setEditingSchedule(schedule)}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteSchedule({ id: schedule.id })}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddScheduleModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          isAdding={isAdding}
        />
      )}

      {editingSchedule && (
        <EditScheduleModal
          scheduleData={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSubmit={(data) => updateSchedule(data)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
