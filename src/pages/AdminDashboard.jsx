"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById, getMenuSections, getMenuItems } from "../services/restaurant.service"
import { getQRCode } from "../services/qrcode.service"
import AdminNavbar from "../components/AdminNavbar"
import "bootstrap/dist/css/bootstrap.min.css"
import "./adminDashboard.css"

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [stats, setStats] = useState({
    menuViews: 0,
    qrScans: 0,
    totalSections: 0,
    totalItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadDashboardData(storedRestaurantId)
    } else {
      setError("Please select a restaurant first")
      setLoading(false)
    }
  }, [])

  const loadDashboardData = async (restId) => {
    setLoading(true)

    // Load restaurant details
    const restResult = await getRestaurantById(restId)
    if (restResult.success) {
      setRestaurant(restResult.restaurant)
    }

    // Load menu sections
    const sectionsResult = await getMenuSections(restId)
    const totalSections = sectionsResult.success ? sectionsResult.sections.length : 0

    // Load menu items
    const itemsResult = await getMenuItems(restId)
    const totalItems = itemsResult.success ? itemsResult.items.length : 0

    // Load QR code data
    const qrResult = await getQRCode(restId)
    const qrScans = qrResult.success ? qrResult.qrCode?.scans || 0 : 0

    setStats({
      menuViews: qrScans * 3, // Estimate: 3 views per scan
      qrScans: qrScans,
      totalSections: totalSections,
      totalItems: totalItems,
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <Spinner animation="border" />
        </div>
      </>
    )
  }

  if (!restaurantId || error) {
    return (
      <>
        <AdminNavbar />
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <Alert variant="warning">
            <Alert.Heading>No Restaurant Selected</Alert.Heading>
            <p>Please select a restaurant from the restaurant management page.</p>
            <button className="btn btn-primary" onClick={() => navigate("/admin/restaurants")}>
              Go to Restaurants
            </button>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-root">
        <main className="main-content">
          {/* TOP BAR */}
          <div className="topbar">
            <div className="search">
              <i className="bi bi-search"></i>
              <input placeholder="Search menu items..." />
            </div>
            <div className="top-icons d-flex gap-3 align-items-center">
              <i className="bi bi-bell"></i>
              <div className="avatar" style={{ color: "#fff" }}>
                {restaurant?.name?.charAt(0) || "A"}
              </div>
            </div>
          </div>

          {/* HEADER */}
          <div className="header">
            <div>
              <h2>Welcome back, {restaurant?.name || "Restaurant Owner"}!</h2>
              <p>Here's a summary of your restaurant's activity.</p>
            </div>
            <div className="actions">
              <button className="btn btn-download" onClick={() => navigate("/admin/qr")}>
                <i className="bi bi-qr-code-scan"></i> Generate New QR
              </button>
              <button className="btn btn-download" onClick={() => navigate("/admin/menu")}>
                <i className="bi bi-pencil"></i> Edit Menu
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="row g-4">
            <Stat
              title="Total QR Scans"
              value={stats.qrScans.toString()}
              meta={stats.qrScans > 0 ? "Active tracking" : "Generate QR to start"}
              color="green"
            />
            <Stat title="Estimated Views" value={stats.menuViews.toString()} meta="Based on QR scans" color="green" />
            <Stat
              title="Menu Sections"
              value={stats.totalSections.toString()}
              meta={stats.totalSections === 0 ? "Add your first section" : "Active sections"}
              color={stats.totalSections === 0 ? "orange" : "green"}
            />
            <Stat
              title="Menu Items"
              value={stats.totalItems.toString()}
              meta={stats.totalItems === 0 ? "Add menu items" : "Total items"}
              color={stats.totalItems === 0 ? "orange" : "green"}
            />
          </div>

          {/* LOWER */}
          <div className="row g-4 mt-1">
            <div className="col-lg-8">
              <div className="card-alt">
                <h6>Quick Actions</h6>
                <div className="d-flex flex-column gap-3 mt-3">
                  {stats.totalSections === 0 && (
                    <div className="alert alert-info">
                      <strong>Get Started:</strong> Add your first menu section to organize your menu items.
                      <button className="btn btn-sm btn-primary ms-3" onClick={() => navigate("/admin/menu")}>
                        Add Section
                      </button>
                    </div>
                  )}
                  {stats.totalItems === 0 && stats.totalSections > 0 && (
                    <div className="alert alert-info">
                      <strong>Next Step:</strong> Add menu items to your sections.
                      <button className="btn btn-sm btn-primary ms-3" onClick={() => navigate("/admin/menu")}>
                        Add Items
                      </button>
                    </div>
                  )}
                  {stats.qrScans === 0 && stats.totalItems > 0 && (
                    <div className="alert alert-info">
                      <strong>Almost Done:</strong> Generate a QR code for customers to scan.
                      <button className="btn btn-sm btn-primary ms-3" onClick={() => navigate("/admin/qr")}>
                        Generate QR
                      </button>
                    </div>
                  )}
                  {stats.totalSections > 0 && stats.totalItems > 0 && stats.qrScans > 0 && (
                    <div className="alert alert-success">
                      <strong>All Set!</strong> Your digital menu is live and customers are scanning your QR code.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card-alt">
                <div className="d-flex justify-content-between">
                  <h6>Restaurant Info</h6>
                  <span className="link" style={{ cursor: "pointer" }} onClick={() => navigate("/admin")}>
                    Edit
                  </span>
                </div>
                <div className="mt-3">
                  <p className="mb-2">
                    <strong>Cuisine:</strong> {restaurant?.cuisineType || "Not set"}
                  </p>
                  <p className="mb-2">
                    <strong>Address:</strong> {restaurant?.address || "Not set"}
                  </p>
                  <p className="mb-2">
                    <strong>Phone:</strong> {restaurant?.phone || "Not set"}
                  </p>
                  <p className="mb-0">
                    <strong>Status:</strong>{" "}
                    <span className={restaurant?.status === "active" ? "green" : "orange"}>
                      {restaurant?.status || "Unknown"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

function Stat({ title, value, meta, color }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div className="card-alt">
        <small>{title}</small>
        <h3>{value}</h3>
        <span className={color}>{meta}</span>
      </div>
    </div>
  )
}
