import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/routes/RoutesPage";
import BusesPage from "./pages/buses/BusesPage";
import SchedulesPage from "./pages/schedules/SchedulesPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SettingsPage from "./pages/Settings/SettingsPage";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="buses" element={<BusesPage />} />
            <Route path="schedules" element={<SchedulesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
