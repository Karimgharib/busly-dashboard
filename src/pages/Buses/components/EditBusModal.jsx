import { useState, useEffect } from "react";

const BUS_TYPES = ["standard", "VIP", "luxury"];
const AMENITY_OPTIONS = [
  "WiFi",
  "AC",
  "USB Charging",
  "Reclining Seats",
  "TV",
  "Restroom",
  "Snacks",
];

export default function EditBusModal({
  busData,
  onClose,
  onSubmit,
  isUpdating,
}) {
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [busType, setBusType] = useState("standard");
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    if (busData) {
      setName(busData.name || "");
      setPlateNumber(busData.plate_number || "");
      setTotalSeats(busData.total_seats?.toString() || "");
      setBusType(busData.bus_type || "standard");
      setAmenities(busData.amenities || []);
    }
  }, [busData]);

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !plateNumber || !totalSeats) return;
    onSubmit({
      id: busData.id,
      name,
      plate_number: plateNumber,
      total_seats: parseInt(totalSeats),
      bus_type: busType,
      amenities,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Bus</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Seats
              </label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                min="1"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bus Type
              </label>
              <select
                value={busType}
                onChange={(e) => setBusType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {BUS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${amenities.includes(a) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
