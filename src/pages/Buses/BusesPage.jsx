import { useState } from "react";
import { Bus, Plus, Trash2, Power, PowerOff, Pencil } from "lucide-react"; // Added Pencil
import { useAuth } from "../../context/AuthContext";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import { useSupabaseMutate } from "../../hooks/useSupabaseMutate";
import AddBusModal from "./components/AddBusModal";
import EditBusModal from "./components/EditBusModal"; // Import Edit Modal

export default function BusesPage() {
  const { tenantId, tenant } = useAuth();
  const primaryColor = tenant?.primary_color || "#2563eb";

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null); // <-- Add state

  const { data: buses = [], isLoading } = useSupabaseQuery({
    table: "buses",
    queryKey: ["buses", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { mutate: addBus } = useSupabaseMutate({
    table: "buses",
    method: "insert",
    queryKeysToInvalidate: [["buses", tenantId]],
    onSuccess: () => setShowAddModal(false),
  });

  const { mutate: updateBus, isPending: isUpdating } = useSupabaseMutate({
    // <-- Add mutation
    table: "buses",
    method: "update",
    queryKeysToInvalidate: [["buses", tenantId]],
    onSuccess: () => setEditingBus(null),
  });

  const { mutate: deleteBus } = useSupabaseMutate({
    table: "buses",
    method: "delete",
    queryKeysToInvalidate: [["buses", tenantId]],
  });

  const { mutate: toggleActive } = useSupabaseMutate({
    table: "buses",
    method: "update",
    queryKeysToInvalidate: [["buses", tenantId]],
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading buses...
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-500 mt-1">{buses.length} buses registered</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Bus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className={`border rounded-lg p-4 transition ${bus.is_active ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bus size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">{bus.name}</h3>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${bus.bus_type === "VIP" ? "bg-purple-100 text-purple-700" : bus.bus_type === "luxury" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}
              >
                {bus.bus_type}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <p>
                Plate:{" "}
                <span className="font-medium text-gray-900">
                  {bus.plate_number}
                </span>
              </p>
              <p>
                Seats:{" "}
                <span className="font-medium text-gray-900">
                  {bus.total_seats}
                </span>
              </p>
              {bus.amenities && bus.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {bus.amenities.map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t">
              <button
                onClick={() =>
                  toggleActive({ id: bus.id, is_active: !bus.is_active })
                }
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded transition ${bus.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
              >
                {bus.is_active ? <PowerOff size={14} /> : <Power size={14} />}{" "}
                {bus.is_active ? "Deactivate" : "Activate"}
              </button>

              {/* EDIT BUTTON */}
              <button
                onClick={() => setEditingBus(bus)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              >
                <Pencil size={14} /> Edit
              </button>

              <button
                onClick={() => {
                  if (confirm("Delete this bus?")) deleteBus({ id: bus.id });
                }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {buses.length === 0 && (
        <div className="text-center py-12">
          <Bus size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No buses yet. Add your first bus!</p>
        </div>
      )}

      {showAddModal && (
        <AddBusModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => addBus({ ...data, tenant_id: tenantId })}
        />
      )}

      {/* EDIT MODAL */}
      {editingBus && (
        <EditBusModal
          busData={editingBus}
          onClose={() => setEditingBus(null)}
          onSubmit={(data) => updateBus(data)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
