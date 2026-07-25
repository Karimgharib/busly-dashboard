// bus-dashboard/src/pages/routes/components/PickupPointsManager.jsx
import { useState } from "react";
import { Plus, Trash2, MapPin, Loader2 } from "lucide-react";
import { useSupabaseQuery } from "../../../hooks/useSupabaseQuery";
import { useSupabaseMutate } from "../../../hooks/useSupabaseMutate";
import { useAuth } from "../../../context/AuthContext";

export default function PickupPointsManager({ route }) {
  const { tenantId } = useAuth();
  const [newName, setNewName] = useState("");

  const { data: pickupPoints = [], isLoading } = useSupabaseQuery({
    table: "pickup_points",
    queryKey: ["pickup-points", route.id],
    select: "id, name, created_at",
    filters: { route_id: route.id, tenant_id: tenantId },
    orderBy: { column: "created_at", asc: true },
    enabled: !!route.id && !!tenantId,
  });

  const { mutate: addPoint, isPending: isAdding } = useSupabaseMutate({
    table: "pickup_points",
    method: "insert",
    queryKeysToInvalidate: [["pickup-points", route.id]],
    onSuccess: () => setNewName(""),
  });

  const { mutate: deletePoint, isPending: isDeleting } = useSupabaseMutate({
    table: "pickup_points",
    method: "delete",
    queryKeysToInvalidate: [["pickup-points", route.id]],
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPoint({
      name: newName.trim(),
      route_id: route.id,
      tenant_id: tenantId,
    });
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <MapPin size={12} />
        Pickup Points — {route.from_city} → {route.to_city}
      </p>

      {/* Existing points */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
          <Loader2 size={14} className="animate-spin" />
          Loading...
        </div>
      ) : pickupPoints.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">No pickup points yet.</p>
      ) : (
        <div className="space-y-1.5 mb-3">
          {pickupPoints.map((point) => (
            <div
              key={point.id}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg group"
            >
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <MapPin size={13} className="text-gray-400 shrink-0" />
                {point.name}
              </span>
              <button
                onClick={() => deletePoint({ id: point.id })}
                disabled={isDeleting}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new point */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Tahrir Square"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
        />
        <button
          type="submit"
          disabled={isAdding || !newName.trim()}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isAdding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add
        </button>
      </form>
    </div>
  );
}
