import { useState, useEffect } from "react";
import { useSupabaseQuery } from "../../../hooks/useSupabaseQuery";

export default function EditScheduleModal({
  scheduleData,
  onClose,
  onSubmit,
  isUpdating,
}) {
  const [routeId, setRouteId] = useState("");
  const [busId, setBusId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [price, setPrice] = useState("");
  const [availableSeats, setAvailableSeats] = useState("");
  const [status, setStatus] = useState("scheduled");

  const { data: routes = [] } = useSupabaseQuery({
    table: "routes",
    queryKey: ["routes-dropdown"],
  });
  const { data: buses = [] } = useSupabaseQuery({
    table: "buses",
    queryKey: ["buses-dropdown"],
  });

  useEffect(() => {
    if (scheduleData) {
      setRouteId(scheduleData.route_id || "");
      setBusId(scheduleData.bus_id || "");
      // Slice ISO string to make it compatible with datetime-local input (YYYY-MM-DDTHH:mm)
      setDepartureTime(scheduleData.departure_time?.slice(0, 16) || "");
      setArrivalTime(scheduleData.arrival_time?.slice(0, 16) || "");
      setPrice(scheduleData.price?.toString() || "");
      setAvailableSeats(scheduleData.available_seats?.toString() || "");
      setStatus(scheduleData.status || "scheduled");
    }
  }, [scheduleData]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!routeId || !busId || !departureTime || !arrivalTime || !price) return;
    onSubmit({
      id: scheduleData.id,
      route_id: routeId,
      bus_id: busId,
      departure_time: departureTime,
      arrival_time: arrivalTime,
      price: parseFloat(price),
      available_seats: parseInt(availableSeats),
      status,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Schedule</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              required
            >
              <option value="">Select a route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.from_city} → {route.to_city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus
            </label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              required
            >
              <option value="">Select a bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.name} ({bus.total_seats} seats)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure
              </label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival
              </label>
              <input
                type="datetime-local"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (EGP)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats
              </label>
              <input
                type="number"
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                min="1"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
            >
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="departed">Departed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
