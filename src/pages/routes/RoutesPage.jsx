// bus-dashboard/src/pages/routes/RoutesPage.jsx
import { useState } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Clock,
  Route,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery";
import { useSupabaseMutate } from "../../hooks/useSupabaseMutate";
import AddRouteModal from "./components/AddRouteModal";
import EditRouteModal from "./components/EditRouteModal";
import PickupPointsManager from "./components/PickupPointsManager";

export default function RoutesPage() {
  const { tenantId, tenant } = useAuth();
  const primaryColor = tenant?.primary_color || "#2563eb";

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  const { data: routes = [], isLoading } = useSupabaseQuery({
    table: "routes",
    queryKey: ["routes", tenantId],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  const { mutate: addRoute, isPending: isAdding } = useSupabaseMutate({
    table: "routes",
    method: "insert",
    queryKeysToInvalidate: [["routes", tenantId]],
    onSuccess: () => setShowAddModal(false),
  });

  const { mutate: updateRoute, isPending: isUpdating } = useSupabaseMutate({
    table: "routes",
    method: "update",
    queryKeysToInvalidate: [["routes", tenantId]],
    onSuccess: () => setEditingRoute(null),
  });

  const { mutate: deleteRoute } = useSupabaseMutate({
    table: "routes",
    method: "delete",
    queryKeysToInvalidate: [["routes", tenantId]],
  });

  function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  const toggleExpand = (routeId) => {
    setExpandedRouteId((prev) => (prev === routeId ? null : routeId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Routes</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your bus routes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} />
          Add Route
        </button>
      </div>

      {/* Routes List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : routes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No routes yet</div>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            return (
              <div
                key={route.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Route row */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Route size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {route.from_city} → {route.to_city}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={12} />
                          {route.distance_km} km
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(route.duration_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        route.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {route.is_active ? "Active" : "Inactive"}
                    </span>

                    {/* Pickup points toggle */}
                    <button
                      onClick={() => toggleExpand(route.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isExpanded
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <MapPin size={12} />
                      Pickup Points
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => setEditingRoute(route)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteRoute({ id: route.id })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Pickup points panel */}
                {isExpanded && (
                  <div className="px-5 pb-5">
                    <PickupPointsManager route={route} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddRouteModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => addRoute({ ...data, tenant_id: tenantId })}
          isAdding={isAdding}
        />
      )}

      {editingRoute && (
        <EditRouteModal
          routeData={editingRoute}
          onClose={() => setEditingRoute(null)}
          onSubmit={(data) => updateRoute(data)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}
