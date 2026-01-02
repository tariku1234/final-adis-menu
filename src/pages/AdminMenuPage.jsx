"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import {
  getMenuSections,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/restaurant.service"
import { getRestaurantById } from "../services/restaurant.service"
import AdminNavbar from "../components/AdminNavbar"
import "./AdminMenuPage.css"

export default function AdminMenuPage() {
  const { currentUser } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [sections, setSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Section Modal State
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [sectionFormData, setSectionFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  })

  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedSectionForItem, setSelectedSectionForItem] = useState(null)
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: "",
    ingredients: "",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: 0,
    displayOrder: 0,
  })
  const [itemImageFile, setItemImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Active section for viewing
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadRestaurantData(storedRestaurantId)
    } else {
      setError("Please select a restaurant first")
      setLoading(false)
    }
  }, [])

  const loadRestaurantData = async (restId) => {
    setLoading(true)

    // Load restaurant details
    const restResult = await getRestaurantById(restId)
    if (restResult.success) {
      setRestaurant(restResult.restaurant)
    }

    // Load sections
    const sectionsResult = await getMenuSections(restId)
    if (sectionsResult.success) {
      setSections(sectionsResult.sections)
      if (sectionsResult.sections.length > 0) {
        setActiveSection(sectionsResult.sections[0].id)
      }
    }

    // Load all menu items
    const itemsResult = await getMenuItems(restId)
    if (itemsResult.success) {
      setMenuItems(itemsResult.items)
    }

    setLoading(false)
  }

  // ============================================
  // SECTION MANAGEMENT
  // ============================================

  const handleOpenSectionModal = (section = null) => {
    if (section) {
      setEditingSection(section)
      setSectionFormData({
        name: section.name,
        description: section.description || "",
        displayOrder: section.displayOrder || 0,
      })
    } else {
      setEditingSection(null)
      setSectionFormData({
        name: "",
        description: "",
        displayOrder: sections.length,
      })
    }
    setShowSectionModal(true)
    setError("")
  }

  const handleCloseSectionModal = () => {
    setShowSectionModal(false)
    setEditingSection(null)
  }

  const handleSectionSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      let result
      if (editingSection) {
        result = await updateMenuSection(editingSection.id, sectionFormData)
      } else {
        result = await createMenuSection(restaurantId, sectionFormData)
      }

      if (result.success) {
        setSuccess(editingSection ? "Section updated!" : "Section created!")
        await loadRestaurantData(restaurantId)
        handleCloseSectionModal()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An error occurred")
    }

    setSubmitting(false)
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section? All items in it will remain but need reassignment.")) {
      return
    }

    const result = await deleteMenuSection(sectionId)
    if (result.success) {
      setSuccess("Section deleted!")
      await loadRestaurantData(restaurantId)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error)
    }
  }

  // ============================================
  // ITEM MANAGEMENT
  // ============================================

  const handleOpenItemModal = (sectionId, item = null) => {
    setSelectedSectionForItem(sectionId)

    if (item) {
      setEditingItem(item)
      setItemFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(", ") : "",
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        spicyLevel: item.spicyLevel || 0,
        displayOrder: item.displayOrder || 0,
      })
    } else {
      setEditingItem(null)
      const itemsInSection = menuItems.filter((i) => i.sectionId === sectionId)
      setItemFormData({
        name: "",
        description: "",
        price: "",
        ingredients: "",
        isAvailable: true,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        spicyLevel: 0,
        displayOrder: itemsInSection.length,
      })
    }

    setItemImageFile(null)
    setShowItemModal(true)
    setError("")
  }

  const handleCloseItemModal = () => {
    setShowItemModal(false)
    setEditingItem(null)
    setSelectedSectionForItem(null)
  }

  const handleItemSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      // Parse ingredients
      const ingredientsArray = itemFormData.ingredients
        .split(",")
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0)

      const itemData = {
        ...itemFormData,
        price: Number.parseFloat(itemFormData.price),
        ingredients: ingredientsArray,
      }

      let result
      if (editingItem) {
        result = await updateMenuItem(editingItem.id, itemData, itemImageFile)
      } else {
        result = await createMenuItem(restaurantId, selectedSectionForItem, itemData, itemImageFile)
      }

      if (result.success) {
        setSuccess(editingItem ? "Item updated!" : "Item added!")
        await loadRestaurantData(restaurantId)
        handleCloseItemModal()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("An error occurred: " + err.message)
    }

    setSubmitting(false)
  }

  const handleDeleteItem = async (itemId, imagePath) => {
    if (!window.confirm("Delete this menu item?")) {
      return
    }

    const result = await deleteMenuItem(itemId, imagePath)
    if (result.success) {
      setSuccess("Item deleted!")
      await loadRestaurantData(restaurantId)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error)
    }
  }

  const getItemsForSection = (sectionId) => {
    return menuItems.filter((item) => item.sectionId === sectionId)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    )
  }

  if (!restaurantId) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="warning">
          <Alert.Heading>No Restaurant Selected</Alert.Heading>
          <p>Please go to the restaurant management page and select a restaurant.</p>
          <Button className="btn-primary-accent" href="/admin/restaurants">
            Go to Restaurants
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <AdminNavbar />
      <div className="admin-menu-page">
        <Container fluid className="py-4">
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1>Menu Management</h1>
                  <p className="text-muted">{restaurant?.name || "Loading..."}</p>
                </div>
                <Button className="btn-primary-accent" onClick={() => handleOpenSectionModal()}>
                  + Add Section
                </Button>
              </div>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Row>
            {/* Sections Sidebar */}
            <Col md={3} lg={2} className="mb-4">
              <Card>
                <Card.Header className="bg-white">
                  <strong>Sections</strong>
                </Card.Header>
                <Card.Body className="p-0">
                  {sections.length === 0 ? (
                    <div className="p-3 text-center text-muted">
                      <small>No sections yet</small>
                    </div>
                  ) : (
                    <div className="section-list">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className={`section-item ${activeSection === section.id ? "active" : ""}`}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <div className="flex-grow-1">
                            <div className="fw-bold">{section.name}</div>
                            <small className="text-muted">{getItemsForSection(section.id).length} items</small>
                          </div>
                          <div className="section-actions">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 me-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenSectionModal(section)
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSection(section.id)
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Menu Items */}
            <Col md={9} lg={10}>
              {sections.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <h3>No Sections Yet</h3>
                    <p className="text-muted">Create your first menu section to get started</p>
                    <Button className="btn-primary-accent" onClick={() => handleOpenSectionModal()}>
                      Add Section
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                sections
                  .filter((section) => !activeSection || section.id === activeSection)
                  .map((section) => (
                    <div key={section.id} className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h2>{section.name}</h2>
                          {section.description && <p className="text-muted">{section.description}</p>}
                        </div>
                        <Button className="btn-primary-accent" onClick={() => handleOpenItemModal(section.id)}>
                          + Add Item
                        </Button>
                      </div>

                      {getItemsForSection(section.id).length === 0 ? (
                        <Card className="text-center py-4">
                          <Card.Body>
                            <p className="text-muted mb-2">No items in this section</p>
                            <Button className="btn-outline-accent" size="sm" onClick={() => handleOpenItemModal(section.id)}>
                              Add First Item
                            </Button>
                          </Card.Body>
                        </Card>
                      ) : (
                        <Row>
                          {getItemsForSection(section.id).map((item) => (
                            <Col md={6} lg={4} xl={3} key={item.id} className="mb-4">
                              <Card className="menu-item-card h-100">
                                <div className="menu-card-img-wrapper">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="menu-card-hero" />
                                  ) : (
                                    <div className="menu-card-placeholder">
                                      <i className="bi bi-image"></i>
                                    </div>
                                  )}

                                  <div className="availability-badge">
                                    {item.isAvailable ? (
                                      <Badge className="badge-accent">Available</Badge>
                                    ) : (
                                      <Badge bg="secondary">Unavailable</Badge>
                                    )}
                                  </div>
                                </div>
                                <Card.Body>
                                  <div className="text-center mb-2">
                                    <h5 className="mb-0">{item.name}</h5>
                                    <p className="text-muted small mt-1 mb-2">{item.description}</p>
                                    <div className="item-price-text">${item.price.toFixed(2)}</div>
                                  </div>
                                  <div className="d-flex justify-content-center gap-2 mt-2">
                                    <Button
                                      className="btn-outline-accent"
                                      size="sm"
                                      onClick={() => handleOpenItemModal(section.id, item)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      className="btn-outline-accent"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id, item.imagePath)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </Card.Body>

                              </Card>
                            </Col>
                          ))}
                        </Row>
                      )}
                    </div>
                  ))
              )}
            </Col>
          </Row>
        </Container>

        {/* Section Modal */}
        <Modal show={showSectionModal} onHide={handleCloseSectionModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingSection ? "Edit Section" : "Add Section"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSectionSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Section Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                  placeholder="e.g., Appetizers, Main Course, Desserts"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={sectionFormData.description}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Display Order</Form.Label>
                <Form.Control
                  type="number"
                  value={sectionFormData.displayOrder}
                  onChange={(e) =>
                    setSectionFormData({ ...sectionFormData, displayOrder: Number.parseInt(e.target.value) })
                  }
                />
                <Form.Text className="text-muted">Lower numbers appear first</Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button className="btn-outline-accent" onClick={handleCloseSectionModal}>
                  Cancel
                </Button>
                <Button className="btn-primary-accent" type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingSection ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Item Modal */}
        <Modal show={showItemModal} onHide={handleCloseItemModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingItem ? "Edit Item" : "Add Item"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleItemSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={itemFormData.price}
                      onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ingredients (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  value={itemFormData.ingredients}
                  onChange={(e) => setItemFormData({ ...itemFormData, ingredients: e.target.value })}
                  placeholder="e.g., tomato, cheese, basil"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Item Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setItemImageFile(e.target.files[0])} />
                {editingItem?.image && !itemImageFile && (
                  <div className="mt-2">
                    <img
                      src={editingItem.image || "/placeholder.svg"}
                      alt="Current"
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  </div>
                )}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Spicy Level</Form.Label>
                    <Form.Select
                      value={itemFormData.spicyLevel}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, spicyLevel: Number.parseInt(e.target.value) })
                      }
                    >
                      <option value={0}>Not Spicy</option>
                      <option value={1}>Mild</option>
                      <option value={2}>Medium</option>
                      <option value={3}>Hot</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Order</Form.Label>
                    <Form.Control
                      type="number"
                      value={itemFormData.displayOrder}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, displayOrder: Number.parseInt(e.target.value) })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Available"
                  checked={itemFormData.isAvailable}
                  onChange={(e) => setItemFormData({ ...itemFormData, isAvailable: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Vegetarian"
                  checked={itemFormData.isVegetarian}
                  onChange={(e) => setItemFormData({ ...itemFormData, isVegetarian: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Vegan"
                  checked={itemFormData.isVegan}
                  onChange={(e) => setItemFormData({ ...itemFormData, isVegan: e.target.checked })}
                />
                <Form.Check
                  type="checkbox"
                  label="Gluten Free"
                  checked={itemFormData.isGlutenFree}
                  onChange={(e) => setItemFormData({ ...itemFormData, isGlutenFree: e.target.checked })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button className="btn-outline-accent" onClick={handleCloseItemModal}>
                  Cancel
                </Button>
                <Button className="btn-primary-accent" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    "Update Item"
                  ) : (
                    "Add Item"
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  )
}
