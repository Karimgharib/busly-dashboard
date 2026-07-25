// bus-dashboard/src/pages/schedules/components/AddScheduleModal.jsx
import { useState, useEffect, useMemo } from "react";
import { useSupabaseQuery } from "../../../hooks/useSupabaseQuery";
import { useAuth } from "../../../context/AuthContext";
import { Plus, Trash2, Zap, Calendar, Clock, ChevronRight } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "HH:mm" into total minutes from midnight */
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Add minutes to a "HH:mm" string, returns new "HH:mm" (wraps past midnight) */
function addMinutesToTime(t, mins) {
  const total = (timeToMinutes(t) + mins) % (24 * 60);
  const h = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Build a datetime-local string using today's date + a "HH:mm" time */
function buildDatetime(timeStr) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${timeStr}`;
}

/** Format "HH:mm" → "8:00 AM" style */
function formatDisplayTime(t) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Shared field styles ───────────────────────────────────────────────────────
const input =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition";
const label =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

// ── Component ─────────────────────────────────────────────────────────────────
export default function AddScheduleModal({ onClose, onSubmit, isAdding }) {
  const { tenantId } = useAuth();
  const [tab, setTab] = useState("single"); // "single" | "bulk"

  // ── Shared dropdowns ──────────────────────────────────────────────────────
  const { data: routes = [] } = useSupabaseQuery({
    table: "routes",
    queryKey: ["routes-dropdown"],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });
  const { data: buses = [] } = useSupabaseQuery({
    table: "buses",
    queryKey: ["buses-dropdown"],
    filters: { tenant_id: tenantId },
    enabled: !!tenantId,
  });

  // ── Single form state ─────────────────────────────────────────────────────
  const [s, setS] = useState({
    routeId: "",
    busId: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    availableSeats: "",
    status: "active",
  });

  useEffect(() => {
    const bus = buses.find((b) => b.id === s.busId);
    if (bus)
      setS((p) => ({ ...p, availableSeats: bus.total_seats.toString() }));
  }, [s.busId, buses]);

  // Auto-fill arrival from route duration (single)
  useEffect(() => {
    if (!s.departureTime || !s.routeId) return;
    const route = routes.find((r) => r.id === s.routeId);
    if (!route?.duration_minutes) return;
    const dep = new Date(s.departureTime);
    dep.setMinutes(dep.getMinutes() + route.duration_minutes);
    const pad = (n) => String(n).padStart(2, "0");
    const arr = `${dep.getFullYear()}-${pad(dep.getMonth() + 1)}-${pad(dep.getDate())}T${pad(dep.getHours())}:${pad(dep.getMinutes())}`;
    setS((p) => ({ ...p, arrivalTime: arr }));
  }, [s.departureTime, s.routeId, routes]);

  function handleSingleSubmit(e) {
    e.preventDefault();
    const {
      routeId,
      busId,
      departureTime,
      arrivalTime,
      price,
      availableSeats,
      status,
    } = s;
    if (!routeId || !busId || !departureTime || !arrivalTime || !price) return;
    onSubmit([
      {
        route_id: routeId,
        bus_id: busId,
        departure_time: departureTime,
        arrival_time: arrivalTime,
        price: parseFloat(price),
        available_seats: parseInt(availableSeats),
        status,
        tenant_id: tenantId,
      },
    ]);
  }

  // ── Bulk form state ───────────────────────────────────────────────────────
  const [b, setB] = useState({
    routeId: "",
    busId: "",
    price: "",
    startTime: "07:00",
    endTime: "22:00",
    intervalMinutes: "90",
  });
  const [removedIndexes, setRemovedIndexes] = useState(new Set());

  // Reset removed when config changes
  useEffect(() => {
    setRemovedIndexes(new Set());
  }, [b]);

  const selectedRoute = routes.find((r) => r.id === b.routeId);
  const selectedBus = buses.find((bus) => bus.id === b.busId);

  /** Generate preview trips from bulk config */
  const generatedTrips = useMemo(() => {
    const interval = parseInt(b.intervalMinutes);
    if (!b.startTime || !b.endTime || !interval || interval <= 0) return [];
    const startMins = timeToMinutes(b.startTime);
    const endMins = timeToMinutes(b.endTime);
    if (startMins >= endMins) return [];

    const duration = selectedRoute?.duration_minutes || 0;
    const trips = [];
    let current = startMins;

    while (
      current + interval <= endMins ||
      (trips.length === 0 && current < endMins)
    ) {
      const depTime = `${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`;
      const arrMins = current + duration;
      const arrTime = `${String(Math.floor(arrMins / 60) % 24).padStart(2, "0")}:${String(arrMins % 60).padStart(2, "0")}`;
      trips.push({ depTime, arrTime });
      current += interval;
      if (current > endMins) break;
    }
    return trips;
  }, [b.startTime, b.endTime, b.intervalMinutes, selectedRoute]);

  const activeTrips = generatedTrips.filter((_, i) => !removedIndexes.has(i));

  function handleBulkSubmit(e) {
    e.preventDefault();
    if (!b.routeId || !b.busId || !b.price || activeTrips.length === 0) return;

    const seats = selectedBus?.total_seats || 0;
    const payload = activeTrips.map(({ depTime, arrTime }) => ({
      route_id: b.routeId,
      bus_id: b.busId,
      price: parseFloat(b.price),
      available_seats: seats,
      status: "active",
      tenant_id: tenantId,
      departure_time: buildDatetime(depTime),
      arrival_time: buildDatetime(arrTime),
    }));
    onSubmit(payload);
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Add Schedule</h3>

          {/* Tab toggle */}
          <div className="flex gap-1 mt-3 p-1 bg-gray-100 rounded-xl w-fit">
            {[
              { id: "single", icon: Calendar, label: "Single Trip" },
              { id: "bulk", icon: Zap, label: "Bulk Generate" },
            ].map(({ id, icon: Icon, label: lbl }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={14} />
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5">
          {/* ── SINGLE TAB ── */}
          {tab === "single" && (
            <form
              id="single-form"
              onSubmit={handleSingleSubmit}
              className="space-y-4"
            >
              <div>
                <label className={label}>Route</label>
                <select
                  value={s.routeId}
                  onChange={(e) =>
                    setS((p) => ({ ...p, routeId: e.target.value }))
                  }
                  className={input}
                  required
                >
                  <option value="">Select a route</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.from_city} → {r.to_city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Bus</label>
                <select
                  value={s.busId}
                  onChange={(e) =>
                    setS((p) => ({ ...p, busId: e.target.value }))
                  }
                  className={input}
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
                  <label className={label}>Departure</label>
                  <input
                    type="datetime-local"
                    value={s.departureTime}
                    onChange={(e) =>
                      setS((p) => ({ ...p, departureTime: e.target.value }))
                    }
                    className={input}
                    required
                  />
                </div>
                <div>
                  <label className={label}>Arrival</label>
                  <input
                    type="datetime-local"
                    value={s.arrivalTime}
                    onChange={(e) =>
                      setS((p) => ({ ...p, arrivalTime: e.target.value }))
                    }
                    className={input}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Price (EGP)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={s.price}
                    onChange={(e) =>
                      setS((p) => ({ ...p, price: e.target.value }))
                    }
                    min="0"
                    step="0.01"
                    className={input}
                    required
                  />
                </div>
                <div>
                  <label className={label}>Available Seats</label>
                  <input
                    type="number"
                    value={s.availableSeats}
                    onChange={(e) =>
                      setS((p) => ({ ...p, availableSeats: e.target.value }))
                    }
                    min="1"
                    className={input}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={label}>Status</label>
                <select
                  value={s.status}
                  onChange={(e) =>
                    setS((p) => ({ ...p, status: e.target.value }))
                  }
                  className={input}
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
          )}

          {/* ── BULK TAB ── */}
          {tab === "bulk" && (
            <form
              id="bulk-form"
              onSubmit={handleBulkSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Route</label>
                  <select
                    value={b.routeId}
                    onChange={(e) =>
                      setB((p) => ({ ...p, routeId: e.target.value }))
                    }
                    className={input}
                    required
                  >
                    <option value="">Select route</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.from_city} → {r.to_city}
                      </option>
                    ))}
                  </select>
                  {selectedRoute?.duration_minutes && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={11} /> {selectedRoute.duration_minutes} min
                      trip
                    </p>
                  )}
                </div>
                <div>
                  <label className={label}>Bus</label>
                  <select
                    value={b.busId}
                    onChange={(e) =>
                      setB((p) => ({ ...p, busId: e.target.value }))
                    }
                    className={input}
                    required
                  >
                    <option value="">Select bus</option>
                    {buses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.name} ({bus.total_seats} seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={label}>Price (EGP)</label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={b.price}
                  onChange={(e) =>
                    setB((p) => ({ ...p, price: e.target.value }))
                  }
                  min="0"
                  step="0.01"
                  className={input}
                  required
                />
              </div>

              {/* Time config */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Schedule Pattern
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={label}>First Trip</label>
                    <input
                      type="time"
                      value={b.startTime}
                      onChange={(e) =>
                        setB((p) => ({ ...p, startTime: e.target.value }))
                      }
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Last Trip By</label>
                    <input
                      type="time"
                      value={b.endTime}
                      onChange={(e) =>
                        setB((p) => ({ ...p, endTime: e.target.value }))
                      }
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Interval (min)</label>
                    <input
                      type="number"
                      value={b.intervalMinutes}
                      onChange={(e) =>
                        setB((p) => ({ ...p, intervalMinutes: e.target.value }))
                      }
                      min="10"
                      step="5"
                      className={input}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  e.g. 90 min interval = every 1.5 hours
                </p>
              </div>

              {/* Preview */}
              {generatedTrips.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Preview — {activeTrips.length} trips
                    </p>
                    {removedIndexes.size > 0 && (
                      <button
                        type="button"
                        onClick={() => setRemovedIndexes(new Set())}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Restore all
                      </button>
                    )}
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {generatedTrips.map(({ depTime, arrTime }, i) => {
                      const removed = removedIndexes.has(i);
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                            removed
                              ? "bg-gray-50 opacity-40"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <Clock size={13} className="text-gray-400" />
                            {formatDisplayTime(depTime)}
                            <ChevronRight size={12} className="text-gray-300" />
                            {formatDisplayTime(arrTime)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setRemovedIndexes((prev) => {
                                const next = new Set(prev);
                                removed ? next.delete(i) : next.add(i);
                                return next;
                              })
                            }
                            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
                              removed
                                ? "text-blue-500 hover:bg-blue-50"
                                : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                            }`}
                            title={removed ? "Restore" : "Remove"}
                          >
                            {removed ? (
                              <Plus size={13} />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * Dates default to today. Edit individual schedules to
                    change dates.
                  </p>
                </div>
              )}

              {generatedTrips.length === 0 && b.startTime && b.endTime && (
                <p className="text-sm text-center text-gray-400 py-4">
                  No trips generated — check your start/end times and interval.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={tab === "single" ? "single-form" : "bulk-form"}
            disabled={isAdding || (tab === "bulk" && activeTrips.length === 0)}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isAdding
              ? "Saving..."
              : tab === "bulk"
                ? `Create ${activeTrips.length} Schedule${activeTrips.length !== 1 ? "s" : ""}`
                : "Add Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
