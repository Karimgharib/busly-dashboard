import { useState, useEffect } from "react";

export default function EditRouteModal({
  routeData,
  onClose,
  onSubmit,
  isUpdating,
}) {
  const [form, setForm] = useState({
    from_city: "",
    to_city: "",
    distance_km: "",
    duration_minutes: "",
  });

  // Pre-fill form when modal opens or routeData changes
  useEffect(() => {
    if (routeData) {
      setForm({
        from_city: routeData.from_city || "",
        to_city: routeData.to_city || "",
        distance_km: routeData.distance_km?.toString() || "",
        duration_minutes: routeData.duration_minutes?.toString() || "",
      });
    }
  }, [routeData]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.from_city || !form.to_city) return;

    onSubmit({
      id: routeData.id, // Include ID for the update mutation
      from_city: form.from_city,
      to_city: form.to_city,
      distance_km: parseInt(form.distance_km) || 0,
      duration_minutes: parseInt(form.duration_minutes) || 0,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Route</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="From City"
            value={form.from_city}
            onChange={(e) => setForm({ ...form, from_city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            required
          />
          <input
            type="text"
            placeholder="To City"
            value={form.to_city}
            onChange={(e) => setForm({ ...form, to_city: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={form.distance_km}
            onChange={(e) => setForm({ ...form, distance_km: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            required
          />

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
