"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import {
  createRestaurant,
  getRestaurantsByOwner,
  updateRestaurant,
  deleteRestaurant,
} from "../services/restaurant.service"
import { Container, Row, Col, Button, Card, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap"
import { Plus, Edit, Trash2, MapPin, Phone, Utensils, Info, Image as ImageIcon } from 'lucide-react'
import "./RestaurantManagePage.css"

export default function RestaurantManagePage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    cuisineType: "",
  })
  const [logoFile, setLogoFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
      loadRestaurants()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const result = await getRestaurantsByOwner(currentUser.uid)
      if (result.success) {
        setRestaurants(result.restaurants)
      } else {
        setError(result.error || "Failed to load restaurants")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (restaurant = null) => {
    if (restaurant) {
      setEditingRestaurant(restaurant)
      setFormData({
        name: restaurant.name || "",
        description: restaurant.description || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        cuisineType: restaurant.cuisineType || "",
      })
    } else {
      setEditingRestaurant(null)
      setFormData({ name: "", description: "", address: "", phone: "", email: "", cuisineType: "" })
    }
    setLogoFile(null)
    setCoverFile(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRestaurant(null)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      let result = editingRestaurant 
        ? await updateRestaurant(editingRestaurant.id, formData, logoFile, coverFile)
        : await createRestaurant(currentUser.uid, formData, logoFile, coverFile)

      if (result.success) {
        setSuccess(editingRestaurant ? "Updated successfully!" : "Created successfully!")
        await loadRestaurants()
        setTimeout(() => {
          setSuccess("")
          handleCloseModal()
        }, 1500)
      } else {
        setError(result.error || "Failed to save")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this restaurant? This cannot be undone.")) return
    try {
      const result = await deleteRestaurant(id)
      if (result.success) {
        setSuccess("Deleted successfully!")
        await loadRestaurants()
      }
    } catch (err) {
      setError("Failed to delete")
    }
  }

  const handleSelectRestaurant = (restaurantId) => {
    localStorage.setItem("selectedRestaurantId", restaurantId)
    navigate("/admin/dashboard")
  }

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center public-menu-page">
      <Spinner animation="border" style={{color: 'var(--accent)'}} />
    </div>
  )

  return (
    <div className="public-menu-page min-vh-100">
      <Container className="py-5">
        <Row className="mb-5 align-items-center">
          <Col md={8}>
            <h1 className="fw-bold mb-1">My Restaurants</h1>
            <p className="text-muted mb-0">Manage your locations and brand profiles</p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button className="btn-primary-accent rounded-pill px-4" onClick={() => handleOpenModal()}>
              <Plus size={18} className="me-2" /> Add Restaurant
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" className="rounded-4 border-0 shadow-sm">{error}</Alert>}
        {success && <Alert variant="success" className="rounded-4 border-0 shadow-sm">{success}</Alert>}

        <Row className="g-4">
          {restaurants.map((restaurant) => (
            <Col md={6} lg={4} key={restaurant.id}>
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100 restaurant-manage-card">
                <div 
                  className="manage-card-cover" 
                  style={{ backgroundImage: `url(${restaurant.coverImage || '/placeholder-cover.jpg'})` }}
                >
                  <div className="manage-status-badge">
                    <Badge className={restaurant.status === "active" ? "bg-success" : "bg-secondary"}>
                      {restaurant.status || "active"}
                    </Badge>
                  </div>
                </div>
                
                <Card.Body className="pt-0 position-relative">
                  <div className="manage-logo-wrapper">
                    {restaurant.logo ? (
                      <img src={restaurant.logo} alt={restaurant.name} className="manage-logo-img" />
                    ) : (
                      <div className="manage-logo-placeholder">{restaurant.name.charAt(0)}</div>
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <h5 className="fw-bold mb-1">{restaurant.name}</h5>
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                      <Utensils size={14} className="text-muted" />
                      <span className="small text-muted">{restaurant.cuisineType || "General"}</span>
                    </div>
                    
                    <div className="text-start p-3 bg-light rounded-3 mb-3">
                      <div className="d-flex align-items-start gap-2 mb-2">
                        <MapPin size={14} className="mt-1 text-accent" />
                        <span className="small text-dark text-truncate">{restaurant.address || "No address set"}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={14} className="text-accent" />
                        <span className="small text-dark">{restaurant.phone || "No phone set"}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button 
                        className="btn-primary-accent flex-grow-1 rounded-pill btn-sm fw-bold"
                        onClick={() => handleSelectRestaurant(restaurant.id)}
                      >
                        Enter Dashboard
                      </Button>
                      <Button variant="light" className="rounded-circle p-2 border" onClick={() => handleOpenModal(restaurant)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="light" className="rounded-circle p-2 border text-danger" onClick={() => handleDelete(restaurant.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {restaurants.length === 0 && (
            <Col xs={12}>
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
                <Utensils size={48} className="text-muted mb-3" />
                <h3>Welcome to Addis Menu</h3>
                <p className="text-muted">Create your first restaurant profile to get started.</p>
                <Button className="btn-primary-accent rounded-pill px-5 mt-2" onClick={() => handleOpenModal()}>
                  Create Restaurant
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Container>

      {/* MODAL */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="rounded-4">
        <Modal.Body className="p-4">
          <h4 className="fw-bold mb-4">{editingRestaurant ? "Edit Profile" : "New Restaurant"}</h4>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-uppercase letter-spacing-1">Restaurant Name</Form.Label>
                  <Form.Control 
                    className="rounded-3 border-light-subtle shadow-none py-2"
                    name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Cuisine Type</Form.Label>
                  <Form.Control 
                    className="rounded-3 border-light-subtle"
                    name="cuisineType" value={formData.cuisineType} onChange={(e) => setFormData({...formData, cuisineType: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Phone Number</Form.Label>
                  <Form.Control 
                    className="rounded-3 border-light-subtle"
                    name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Address</Form.Label>
                  <Form.Control 
                    className="rounded-3 border-light-subtle"
                    name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold"><ImageIcon size={14}/> Logo Image</Form.Label>
                  <Form.Control type="file" className="rounded-3" onChange={(e) => setLogoFile(e.target.files[0])} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold"><ImageIcon size={14}/> Cover Photo</Form.Label>
                  <Form.Control type="file" className="rounded-3" onChange={(e) => setCoverFile(e.target.files[0])} />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-2">
              <Button variant="light" className="flex-grow-1 rounded-pill fw-bold border" onClick={handleCloseModal}>Cancel</Button>
              <Button className="btn-primary-accent flex-grow-1 rounded-pill fw-bold" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Restaurant"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}