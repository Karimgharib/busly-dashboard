import { useState } from "react";

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

export default function AddBusModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [busType, setBusType] = useState("standard");
  const [amenities, setAmenities] = useState([]);

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !plateNumber || !totalSeats) return;
    onSubmit({
      name,
      plate_number: plateNumber,
      total_seats: parseInt(totalSeats),
      bus_type: busType,
      amenities,
      is_active: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold mb-4">Add New Bus</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bus Alpha"
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
              placeholder="e.g. ABC-1234"
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
                placeholder="e.g. 45"
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
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    amenities.includes(a)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
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
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
            >
              Add Bus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
