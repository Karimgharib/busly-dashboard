import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSupabaseMutate } from "../../hooks/useSupabaseMutate";

export default function SettingsPage() {
  const { tenant, tenantId, updateTenant } = useAuth();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");

  // Populate form when tenant data loads
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      setSlug(tenant.slug || "");
      setPrimaryColor(tenant.primary_color || "#2563eb");
      setSecondaryColor(tenant.secondary_color || "#1e40af");
    }
  }, [tenant]);

  // Update tenant mutation
  const { mutate: updateTenantDB, isPending: isSaving } = useSupabaseMutate({
    table: "tenants",
    method: "update",
    queryKeysToInvalidate: [["tenants"]],
    onSuccess: (data) => {
      // Update the AuthContext instantly so sidebar color changes immediately
      if (data && data[0]) {
        updateTenant(data[0]);
      }
    },
  });

  function handleSave(e) {
    e.preventDefault();
    updateTenantDB({
      id: tenantId,
      name,
      slug,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  }

  if (!tenant)
    return <div className="p-6 text-gray-400">Loading settings...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings size={24} />
          Settings
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your company profile and branding
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-gray-50"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              passenger-web.com/{slug}
            </p>
          </div>
        </div>

        {/* Branding Colors */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">Your booking site</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
