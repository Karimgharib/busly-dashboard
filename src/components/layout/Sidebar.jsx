import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  Bus,
  Calendar,
  Ticket,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/buses", label: "Buses", icon: Bus },
  { to: "/schedules", label: "Schedules", icon: Calendar },
  { to: "/bookings", label: "Bookings", icon: Ticket },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { profile, tenant, signOut } = useAuth();

  // Fallback to default blue if tenant isn't loaded yet
  const primaryColor = tenant?.primary_color || "#2563eb";
  const secondaryColor = tenant?.secondary_color || "#1e40af";

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo / Brand Area */}
      <div
        className="p-5 border-b border-gray-200"
        style={{ backgroundColor: `${primaryColor}10` }} // Light tint of primary color
      >
        <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
          {tenant?.name || "Bus SaaS"}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Operator Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: primaryColor } : {}
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User Section at Bottom */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-800 truncate">
          {profile?.full_name || "User"}
        </p>
        <p className="text-xs text-gray-400 mb-2 capitalize">
          {profile?.role || "admin"}
        </p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
