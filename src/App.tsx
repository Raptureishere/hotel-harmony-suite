import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppStore";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import NewRoom from "./pages/NewRoom";
import RoomDetail from "./pages/RoomDetail";
import EditRoom from "./pages/EditRoom";
import Bookings from "./pages/Bookings";
import NewBooking from "./pages/NewBooking";
import BookingDetail from "./pages/BookingDetail";
import Guests from "./pages/Guests";
import NewGuest from "./pages/NewGuest";
import GuestDetail from "./pages/GuestDetail";
import EditGuest from "./pages/EditGuest";
import Payments from "./pages/Payments";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// Layout
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

const App = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Rooms */}
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/new" element={<NewRoom />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/rooms/:id/edit" element={<EditRoom />} />

            {/* Bookings */}
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/new" element={<NewBooking />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />

            {/* Guests */}
            <Route path="/guests" element={<Guests />} />
            <Route path="/guests/new" element={<NewGuest />} />
            <Route path="/guests/:id" element={<GuestDetail />} />
            <Route path="/guests/:id/edit" element={<EditGuest />} />

            {/* Other */}
            <Route path="/payments" element={<Payments />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
