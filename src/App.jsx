import { Routes, Route } from "react-router-dom"
import MenuPage from "./pages/MenuPage"
import PaymentPage from "./pages/PaymentPage"
import FeedbackPage from "./pages/FeedbackPage"
import AdminPage from "./pages/AdminPage"
import AdminMenuPage from "./pages/AdminMenuPage"
import AdminQRPage from "./pages/AdminQRPage"
import AdminDashboard from "./pages/AdminDashboard"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import PendingApprovalPage from "./pages/PendingApprovalPage"
import UnauthorizedPage from "./pages/UnauthorizedPage"
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import SetupSuperAdmin from "./pages/SetupSuperAdmin"
import RestaurantManagePage from "./pages/RestaurantManagePage"
import PublicMenuPage from "./pages/PublicMenuPage"
import KitchenManagerPage from "./pages/KitchenManagerPage"
import OrderManagementPage from "./pages/OrderManagementPage"
import OrderTrackingPage from "./pages/OrderTrackingPage" // Importing OrderTrackingPage

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MenuPage />} />
          <Route path="/menu/:restaurantId" element={<PublicMenuPage />} />
          <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} /> {/* Adding tracking route */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/setup-super-admin" element={<SetupSuperAdmin />} />
          {/* Super Admin Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Restaurant Owner Admin Routes */}
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <RestaurantManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <AdminMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/QR"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <AdminQRPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requiredRole="restaurant_owner">
                <OrderManagementPage />
              </ProtectedRoute>
            }
          />
          {/* Kitchen Manager Routes */}
          <Route
            path="/kitchen/orders"
            element={
              <ProtectedRoute requiredRole="kitchen_manager">
                <KitchenManagerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
