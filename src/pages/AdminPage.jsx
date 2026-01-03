"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById, updateRestaurant } from "../services/restaurant.service"
import AdminNavbar from "../components/AdminNavbar"
import { Camera, Save, ArrowLeft } from "lucide-react"
import "./AdminPage.css"

export default function AdminPage() {
  const { currentUser, createKitchenManager } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("settings")
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    cuisineType: "",
  })
  const [kitchenManagerForm, setKitchenManagerForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [kitchenError, setKitchenError] = useState("")
  const [kitchenSuccess, setKitchenSuccess] = useState("")

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadRestaurant(storedRestaurantId)
    } else {
      setLoading(false)
    }
  }, [])

  const loadRestaurant = async (restId) => {
    const result = await getRestaurantById(restId)
    if (result.success) {
      setRestaurant(result.restaurant)
      setFormData({
        name: result.restaurant.name || "",
        address: result.restaurant.address || "",
        phone: result.restaurant.phone || "",
        email: result.restaurant.email || "",
        description: result.restaurant.description || "",
        cuisineType: result.restaurant.cuisineType || "",
      })
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleKitchenManagerChange = (e) => {
    setKitchenManagerForm({ ...kitchenManagerForm, [e.target.name]: e.target.value })
    setKitchenError("")
    setKitchenSuccess("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const result = await updateRestaurant(restaurantId, formData, logoFile, coverFile)
    if (result.success) {
      alert("Restaurant updated successfully!")
      await loadRestaurant(restaurantId)
      setLogoFile(null)
      setCoverFile(null)
    } else {
      alert("Error: " + result.error)
    }
    setSaving(false)
  }

  const handleCreateKitchenManager = async (e) => {
    e.preventDefault()
    setKitchenError("")
    setKitchenSuccess("")

    if (!kitchenManagerForm.password || !kitchenManagerForm.confirmPassword) {
      setKitchenError("Password is required")
      return
    }

    if (kitchenManagerForm.password !== kitchenManagerForm.confirmPassword) {
      setKitchenError("Passwords do not match")
      return
    }

    if (kitchenManagerForm.password.length < 6) {
      setKitchenError("Password must be at least 6 characters")
      return
    }

    setSaving(true)

    try {
      const result = await createKitchenManager(
        kitchenManagerForm.email,
        kitchenManagerForm.password,
        {
          fullName: kitchenManagerForm.fullName,
          phone: kitchenManagerForm.phone,
        },
        restaurantId,
      )

      if (result.success) {
        setKitchenSuccess(
          `Kitchen Manager "${kitchenManagerForm.fullName}" created successfully! They can now log in with their email and password.`,
        )
        setKitchenManagerForm({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" })
      } else {
        setKitchenError(result.error || "Error creating kitchen manager")
      }
    } catch (error) {
      console.error("Error:", error)
      setKitchenError("Failed to create kitchen manager account")
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-public">
        <Spinner animation="border" style={{ color: "var(--accent)" }} />
      </div>
    )

  return (
    <div className="public-menu-page min-vh-100">
      <AdminNavbar />
      <Container className="py-5">
        {!restaurantId ? (
          <Card className="border-0 shadow-sm rounded-4 text-center p-5">
            <h3 className="fw-bold">No Restaurant Selected</h3>
            <Button href="/admin/restaurants" className="btn-primary-accent rounded-pill mt-3">
              Go to Restaurants
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-4 d-flex align-items-center justify-content-between">
              <div>
                <h2 className="fw-bold mb-0">Restaurant Settings</h2>
                <p className="text-muted small">Manage your restaurant and staff</p>
              </div>
              <Button variant="link" href="/admin/dashboard" className="text-dark text-decoration-none">
                <ArrowLeft size={18} className="me-1" /> Back
              </Button>
            </div>

            <div className="mb-4 d-flex gap-2 border-bottom">
              <Button
                variant={activeTab === "settings" ? "primary" : "outline-secondary"}
                onClick={() => setActiveTab("settings")}
                className="border-0 rounded-0 pb-2"
              >
                Restaurant Settings
              </Button>
              <Button
                variant={activeTab === "kitchen" ? "primary" : "outline-secondary"}
                onClick={() => setActiveTab("kitchen")}
                className="border-0 rounded-0 pb-2"
              >
                Kitchen Manager
              </Button>
            </div>

            <Row>
              <Col lg={8} className="mx-auto">
                {activeTab === "settings" && (
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 pb-2 border-bottom">Restaurant Branding</h5>

                    <div className="text-center mb-4">
                      <div className="position-relative d-inline-block mb-3">
                        <div className="admin-logo-preview">
                          {restaurant?.logo ? (
                            <img src={restaurant.logo || "/placeholder.svg"} alt="Logo" />
                          ) : (
                            <div className="admin-logo-placeholder">{formData.name.charAt(0)}</div>
                          )}
                        </div>
                        <label htmlFor="logo-upload" className="logo-edit-badge">
                          <Camera size={16} />
                        </label>
                        <input id="logo-upload" type="file" hidden onChange={(e) => setLogoFile(e.target.files[0])} />
                      </div>
                      <p className="small text-muted mb-0">Click the camera to upload a logo</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                      <h5 className="fw-bold mb-4 pb-2 border-bottom">Basic Information</h5>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label className="small fw-bold">Restaurant Name</Form.Label>
                          <Form.Control
                            className="rounded-3 shadow-none border-light-subtle"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </Col>
                        <Col md={6} className="mb-3">
                          <Form.Label className="small fw-bold">Cuisine Type</Form.Label>
                          <Form.Control
                            className="rounded-3 shadow-none border-light-subtle"
                            name="cuisineType"
                            value={formData.cuisineType}
                            onChange={handleInputChange}
                            placeholder="e.g. Italian, Ethiopian"
                          />
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          className="rounded-3 shadow-none border-light-subtle"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <h5 className="fw-bold mb-4 mt-5 pb-2 border-bottom">Contact & Location</h5>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Address</Form.Label>
                        <Form.Control
                          className="rounded-3 shadow-none border-light-subtle"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Label className="small fw-bold">Phone</Form.Label>
                          <Form.Control
                            className="rounded-3 shadow-none border-light-subtle"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <Form.Label className="small fw-bold">Public Email</Form.Label>
                          <Form.Control
                            className="rounded-3 shadow-none border-light-subtle"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </Col>
                      </Row>

                      <div className="order-summary p-3 mb-4">
                        <Form.Label className="small fw-bold d-block mb-2">Cover Banner Image</Form.Label>
                        <Form.Control
                          type="file"
                          className="bg-white border-0"
                          onChange={(e) => setCoverFile(e.target.files[0])}
                        />
                        <small className="text-muted mt-2 d-block">
                          This image will appear at the top of your public menu.
                        </small>
                      </div>

                      <div className="d-grid">
                        <Button
                          type="submit"
                          className="btn-primary-accent py-3 fw-bold rounded-pill shadow-sm"
                          disabled={saving}
                        >
                          {saving ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <Save size={18} className="me-2" /> SAVE CHANGES
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card>
                )}

                {activeTab === "kitchen" && (
                  <Card className="border-0 shadow-sm rounded-4 p-4">
                    <h5 className="fw-bold mb-4 pb-2 border-bottom">Create Kitchen Manager Account</h5>
                    <p className="text-muted small mb-4">
                      Add a new kitchen manager to manage orders and kitchen operations for your restaurant.
                    </p>

                    {kitchenError && <Alert variant="danger">{kitchenError}</Alert>}
                    {kitchenSuccess && <Alert variant="success">{kitchenSuccess}</Alert>}

                    <Form onSubmit={handleCreateKitchenManager}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Full Name</Form.Label>
                        <Form.Control
                          className="rounded-3 shadow-none border-light-subtle"
                          name="fullName"
                          value={kitchenManagerForm.fullName}
                          onChange={handleKitchenManagerChange}
                          placeholder="Enter kitchen manager name"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          className="rounded-3 shadow-none border-light-subtle"
                          name="email"
                          value={kitchenManagerForm.email}
                          onChange={handleKitchenManagerChange}
                          placeholder="kitchen.manager@restaurant.com"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          className="rounded-3 shadow-none border-light-subtle"
                          name="phone"
                          value={kitchenManagerForm.phone}
                          onChange={handleKitchenManagerChange}
                          placeholder="Enter phone number"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Password</Form.Label>
                        <Form.Control
                          type="password"
                          className="rounded-3 shadow-none border-light-subtle"
                          name="password"
                          value={kitchenManagerForm.password}
                          onChange={handleKitchenManagerChange}
                          placeholder="Create a password (minimum 6 characters)"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          className="rounded-3 shadow-none border-light-subtle"
                          name="confirmPassword"
                          value={kitchenManagerForm.confirmPassword}
                          onChange={handleKitchenManagerChange}
                          placeholder="Confirm the password"
                          required
                        />
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          type="submit"
                          className="btn-primary-accent py-3 fw-bold rounded-pill shadow-sm"
                          disabled={saving}
                        >
                          {saving ? <Spinner size="sm" /> : "Create Kitchen Manager Account"}
                        </Button>
                      </div>
                    </Form>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  )
}
