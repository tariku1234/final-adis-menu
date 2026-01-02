"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, userProfile, loading } = useAuth()

  console.log(" ProtectedRoute - Loading:", loading)
  console.log(" ProtectedRoute - Current User:", currentUser?.uid)
  console.log(" ProtectedRoute - User Role:", userRole)
  console.log(" ProtectedRoute - User Profile:", userProfile)
  console.log(" ProtectedRoute - Required Role:", requiredRole)
  console.log(" ProtectedRoute - Current Path:", window.location.pathname)

  if (loading) {
    console.log(" ProtectedRoute - Showing loading spinner")
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    console.log(" ProtectedRoute - No user, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (userRole === "restaurant_owner") {
    console.log(" ProtectedRoute - Restaurant owner detected")
    if (userProfile && userProfile.status === "pending") {
      console.log(" ProtectedRoute - Status is pending, redirecting")
      return <Navigate to="/pending-approval" replace />
    }
    if (userProfile && userProfile.status === "rejected") {
      console.log(" ProtectedRoute - Status is rejected, redirecting")
      return <Navigate to="/unauthorized" replace />
    }

    const selectedRestaurantId = localStorage.getItem("selectedRestaurantId")
    const isAdminRoute =
      window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/restaurants"

    console.log(" ProtectedRoute - Selected Restaurant ID:", selectedRestaurantId)
    console.log(" ProtectedRoute - Is Admin Route:", isAdminRoute)

    if (!selectedRestaurantId && isAdminRoute) {
      console.log(" ProtectedRoute - No restaurant selected, redirecting to restaurant selection")
      return <Navigate to="/admin/restaurants" replace />
    }
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(" ProtectedRoute - Role mismatch, redirecting to unauthorized")
    return <Navigate to="/unauthorized" replace />
  }

  console.log(" ProtectedRoute - All checks passed, rendering children")
  return children
}

export default ProtectedRoute
