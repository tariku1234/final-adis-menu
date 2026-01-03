"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Container, Row, Col, Button, Modal, Navbar, Nav, Spinner, Form, Card, Accordion } from "react-bootstrap"
import { Plus, Minus, Trash2, Copy, Star } from "lucide-react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../services/firebase.service"

// Services
import { getRestaurantById, getMenuSections, getMenuItems } from "../services/restaurant.service"
import { useCart } from "../context/CartContext"
import foodImage from "../img/menu.jpg"
import "./PublicMenuPage.css"


export default function PublicMenuPage() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    addToCart,
    cartItems,
    getCartTotal,
    updateQuantity,
    customerName,
    setCustomerName,
    clearCart,
    removeFromCart,
  } = useCart()

  const [restaurant, setRestaurant] = useState(null)
  const [sections, setSections] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDishModal, setShowDishModal] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const [dishQuantity, setDishQuantity] = useState(1)
  const [showMobileOrder, setShowMobileOrder] = useState(false)
  const [featuredItem, setFeaturedItem] = useState(null)
  const [isMobileView, setIsMobileView] = useState(false)

  // Track viewport width to render mobile-only elements reliably
  useEffect(() => {
    const update = () => setIsMobileView(window.innerWidth < 992)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, sec, items] = await Promise.all([
          getRestaurantById(restaurantId),
          getMenuSections(restaurantId),
          getMenuItems(restaurantId),
        ])
        if (res.success) setRestaurant(res.restaurant)
        if (sec.success) setSections(sec.sections.sort((a, b) => a.displayOrder - b.displayOrder))
        if (items.success) setMenuItems(items.items.filter((i) => i.isAvailable))
      } catch (err) {
        console.error("Error loading menu:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [restaurantId])

  // Set featured item (first featured or first item)
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const featured = menuItems.find((m) => m.isFeatured) || menuItems[0]
      setFeaturedItem(featured)
    }
  }, [menuItems])

  // SIMPLIFIED SCROLL FUNCTION - This should work
  const scrollToSection = (sectionId) => {
    // Create a custom event to handle the scroll
    const event = new CustomEvent('scrollToElement', {
      detail: { sectionId }
    });
    window.dispatchEvent(event);
  };

  // Add this event listener in a useEffect
  useEffect(() => {
    const handleScrollToElement = (e) => {
      const { sectionId } = e.detail;
      const selector = sectionId === "your-order" || sectionId === "payment"
        ? `#${sectionId}`
        : `#section-${sectionId}`;

      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('scrollToElement', handleScrollToElement);

    return () => {
      window.removeEventListener('scrollToElement', handleScrollToElement);
    };
  }, []);
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !customerName) return
    setIsSubmitting(true)
    try {
      const orderData = {
        restaurantId,
        customerName,
        items: cartItems,
        totalAmount: getCartTotal(),
        status: "pending",
        createdAt: serverTimestamp(),
        tableNumber: searchParams.get("table") || "Walk-in",
      }
      const docRef = await addDoc(collection(db, "orders"), orderData)
      clearCart()
      navigate(`/order-tracking/${docRef.id}`)
    } catch (err) {
      alert("Error placing order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" style={{ color: "var(--accent)" }} />
      </div>
    )

  // The reusable Order Component
  const OrderContent = () => (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="p-3 text-center order-header">
        <h5 className="mb-0 fw-bold">YOUR ORDER</h5>
      </div>
      <Card.Body className="p-3">
        {cartItems.length === 0 ? (
          <p className="text-center text-muted py-4 small">Your order is empty. Add items from the menu!</p>
        ) : (
          <>
            <div style={{ maxHeight: "400px", overflowY: "auto" }} className="px-1">
              {cartItems.map((item) => (
                <div key={item.id} className="mb-3 border-bottom pb-2">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="small">
                      <Plus size={12} className="me-2 plus-icon" aria-hidden="true" />
                      {item.name}
                    </span>
                    <Trash2
                      size={14}
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => removeFromCart(item.id)}
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center border rounded-pill px-2 bg-light">
                      <Button
                        variant="link"
                        className="text-dark p-0 border-0"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus size={12} />
                      </Button>
                      <span className="mx-2 small fw-bold">{item.quantity}</span>
                      <Button
                        variant="link"
                        className="text-dark p-0 border-0"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                    <span className="small">{(item.price * item.quantity).toFixed(2)} ETB</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-3 order-summary">
              <div className="d-flex justify-content-between mb-2">
                <span className="small">Total</span>
                <span className="item-price-text">{getCartTotal().toFixed(2)} ETB</span>
              </div>
              <Form.Control
                size="sm"
                className="rounded-pill border py-1 mb-3 shadow-none"
                placeholder="Enter Your Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Button
                className="w-100 rounded-pill py-2 fw-bold border-0 btn-primary-accent"
                disabled={!customerName || isSubmitting}
                onClick={handlePlaceOrder}
              >
                {isSubmitting ? <Spinner size="sm" /> : "PLACE ORDER"}
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  )

  return (
    <div className="public-menu-page">
      {/* --- NAVBAR --- */}
      <Navbar expand="lg" sticky="top" className="menu-navbar" style={{ padding: "12px 0", zIndex: 1030 }}>
        <Container>
          <Navbar.Brand
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{ cursor: "pointer", fontFamily: "cursive" }}
            className="fw-bold fs-3"
          >
            {restaurant?.name || "Addis Menu"}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="mx-auto text-center fw-semibold">
              {sections.map((s) => (
                <Nav.Link
                  key={s.id}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(s.id);
                  }}
                  className="px-3 text-dark text-capitalize"
                  href={`#section-${s.id}`}
                >
                  {s.name}
                </Nav.Link>

              ))}
              <Nav.Link
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("payment")
                }}
                className="px-3 text-dark text-capitalize"
                style={{ cursor: "pointer" }}
              >
                Payment
              </Nav.Link>
              <Nav.Link
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection("feedback")
                }}
                className="px-3 text-dark text-capitalize" style={{ cursor: "pointer" }}
              >
                Feedback
              </Nav.Link>
            </Nav>
            <div className="d-none d-lg-flex">
              <Form className="d-flex align-items-center" onSubmit={(e) => e.preventDefault()}>
                <Form.Control
                  type="search"
                  placeholder="Search..."
                  className="me-2 rounded-pill shadow-none"
                  style={{ width: "140px" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="button" className="rounded-pill px-3 btn-primary-accent">
                  Search
                </Button>
              </Form>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- HERO / PAGE HEADER --- */}
      <div style={{ position: "relative" }}>
        <div
          className="w-100 d-flex align-items-center justify-content-center text-center"
          style={{
            height: window.innerWidth >= 992 ? "420px" : "360px",
            backgroundImage: restaurant?.heroImage
              ? `url(${restaurant.heroImage})`
              : restaurant?.image
                ? `url(${restaurant.image})`
                : `url(${foodImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "var(--text)",
          }}
        >
          <div className="hero-inner w-100 d-flex align-items-center justify-content-center" style={{ maxWidth: 1120 }}>
            <div className="hero-text text-start" style={{ flex: 1, padding: "18px" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.78)",
                  padding: "18px 20px",
                  borderRadius: "6px",
                  display: "inline-block",
                  maxWidth: "720px",
                }}
              >
                <h1
                  className="fw-bold mb-2"
                  style={{
                    fontSize: window.innerWidth >= 992 ? "3.6rem" : "2.1rem",
                    letterSpacing: "2px",
                    color: "var(--text)",
                  }}
                >
                  MENU
                </h1>
                <p className="mb-1 small" style={{ opacity: 0.95, color: "var(--muted)" }}>
                  *All Prices include VAT
                </p>
                <p className="mb-0 fst-italic small" style={{ opacity: 0.9, color: "var(--muted)" }}>
                  Tap each food for detail information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Container className="mt-5">
        {/* Mobile search (visible on small screens) */}
        <div className="d-lg-none mb-3 px-2">
          <Form className="d-flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Form.Control
              type="search"
              placeholder="Search menu..."
              className="rounded-pill shadow-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="rounded-pill px-4 btn-primary-accent">Search</Button>
          </Form>
        </div>

        <Row>
          {/* --- LEFT SIDE: MENU --- */}
          <Col lg={8} className="pe-lg-5">
            {sections.map((section) => {
              const filteredItems = menuItems.filter(
                (i) => i.sectionId === section.id && i.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              if (filteredItems.length === 0) return null
              return (
                <div
                  key={section.id}
                  id={`section-${section.id}`}
                  className="mb-5"
                >
                  <div className="menu-section-container">
                    <div className="section-title-wrapper">
                      <div className="section-title-text">{section.name}</div>
                    </div>

                    <div className="items-list-wrapper mt-3">
                      {/* Desktop: compact list */}
                      <div className="d-none d-lg-block">
                        {filteredItems.map((item) => (
                          <div key={item.id} className="menu-item-row">
                            <div className="item-name-text">
                              <button
                                type="button"
                                className="plus-open-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedDish(item)
                                  setDishQuantity(1)
                                  setShowDishModal(true)
                                }}
                                aria-label={`View ${item.name} details`}
                                title="View details"
                              >
                                <Plus size={14} className="plus-icon" aria-hidden="true" />
                              </button>
                              {item.name}
                            </div>
                            <div className="dotted-leader" />
                            <div className="d-flex align-items-center">
                              <div className="item-price-text me-2">{item.price} ETB</div>
                              <Button
                                size="sm"
                                className="order-btn rounded-pill"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  addToCart(item, restaurantId, 1)
                                }}
                              >
                                Order
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mobile: card layout */}
                      <div className="d-lg-none">
                        {filteredItems.map((item) => (
                          <div key={item.id} className="mobile-list-item">
                            {/* Compact mobile item: only +, name, dotted leader, price and Order button (no card/border) */}
                            <div className="menu-item-row" style={{ alignItems: "center" }}>
                              <div className="item-name-text">
                                <button
                                  type="button"
                                  className="plus-open-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDish(item)
                                    setDishQuantity(1)
                                    setShowDishModal(true)
                                  }}
                                  aria-label={`View ${item.name} details`}
                                  title="View details"
                                >
                                  <Plus size={16} className="plus-icon" aria-hidden="true" />
                                </button>
                                {item.name}
                              </div>
                              <div className="dotted-leader" />
                              <div className="d-flex align-items-center">
                                <div className="item-price-text me-2">{item.price} ETB</div>
                                <Button
                                  size="sm"
                                  className="order-btn rounded-pill"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addToCart(item, restaurantId, 1)
                                  }}
                                >
                                  Order
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile section order bar (appears at end of each section on mobile) */}
                    <div className="d-lg-none mobile-section-order-bar mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <small className="text-muted">
                            Items: <strong>{cartItems.length}</strong>
                          </small>
                          <small className="fw-bold item-price-text">{getCartTotal().toFixed(2)} ETB</small>
                        </div>
                        <Button
                          className="rounded-pill px-3 py-1 btn-primary-accent"
                          onClick={() => setShowMobileOrder(true)}
                        >
                          View Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* --- MOBILE ORDER SECTION (Visible only on Mobile, appears after Menu) --- */}
            <div id="your-order" className="d-lg-none mt-5">
              <OrderContent />
            </div>

            {/* --- PAYMENT SECTION --- */}
            <div id="payment" className="mt-5 pt-5 border-top">
              <h3 className="fw-bold text-center mb-4">Payment Methods</h3>
              <Card className="border-0 shadow-sm rounded-4 p-3 mx-auto" style={{ maxWidth: "600px" }}>
                <Accordion defaultActiveKey="0">
                  <Accordion.Item eventKey="0" className="border-0 shadow-sm mb-2 rounded-3">
                    <Accordion.Header>Telebirr</Accordion.Header>
                    <Accordion.Body className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">0912345678</span>
                      <Button variant="outline-warning" size="sm" onClick={() => handleCopy("0912345678")}>
                        <Copy size={14} />
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
                <Button className="w-100 rounded-pill py-3 fw-bold border-0 mt-3 btn-primary-accent">
                  Confirm My Payment
                </Button>
              </Card>
            </div>

            {/* --- FEEDBACK SECTION --- */}
            <div id="feedback" className="mt-5 py-5 border-top text-center">
              <h2 className="fw-bold">WE VALUE YOUR FEEDBACK</h2>
              <Card className="border-0 shadow-sm rounded-4 p-4 mt-4 mx-auto" style={{ maxWidth: "600px" }}>
                <Form>
                  <div className="d-flex justify-content-center gap-1 mb-3" style={{ color: "var(--accent)" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={24} fill={s <= 4 ? "#f3b038" : "none"} />
                    ))}
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Tell us more..."
                    className="rounded-3 mb-3 shadow-none"
                  />
                  <Button className="w-100 rounded-pill py-2 fw-bold btn-primary-accent">Submit Feedback</Button>
                </Form>
              </Card>
            </div>
          </Col>

          {/* --- DESKTOP STICKY SIDEBAR --- */}
          <Col lg={4} className="d-none d-lg-block">
            <div style={{ position: "sticky", top: "100px" }}>
              <OrderContent />
            </div>
          </Col>
        </Row>
      </Container>

      {/* --- MOBILE STICKY ORDER BAR --- */}
      {isMobileView && (
        <div
          className="d-lg-none"
          style={{
            position: "fixed",
            bottom: "calc(12px + env(safe-area-inset-bottom, 12px))",
            left: 12,
            right: 12,
            zIndex: 2000,
          }}
          role="region"
          aria-label="Mobile order bar"
        >
          <div className="d-flex justify-content-between align-items-center p-2 shadow rounded-pill mobile-order-bar">
            <div className="d-flex flex-column">
              <small className="text-muted">
                Items: <strong>{cartItems.length}</strong>
              </small>
              <small className="fw-bold item-price-text">{getCartTotal().toFixed(2)} ETB</small>
            </div>
            <Button
              className="rounded-pill px-4 py-2 fw-bold btn-primary-accent"
              onClick={() => setShowMobileOrder(true)}
            >
              View Order
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Order modal */}
      <Modal show={showMobileOrder} onHide={() => setShowMobileOrder(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OrderContent />
        </Modal.Body>
      </Modal>

      {/* --- DISH DETAIL MODAL --- */}
      <Modal show={showDishModal} onHide={() => setShowDishModal(false)} centered>
        {selectedDish && (
          <Card className="border-0 rounded-4 overflow-hidden">
            {selectedDish.image && (
              <div style={{ position: "relative" }}>
                <Card.Img variant="top" src={selectedDish.image} style={{ height: "240px", objectFit: "cover" }} />
                <button
                  type="button"
                  className="image-close-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDishModal(false)
                  }}
                  aria-label="Close"
                  title="Close"
                >
                  ×
                </button>
              </div>
            )}
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between">
                <h3 className="fw-bold">

                  {selectedDish.name}
                </h3>
                <h4 className="fw-bold item-price-text">{selectedDish.price} ETB</h4>
              </div>
              <p className="text-muted">{selectedDish.description || "Freshly made just for you."}</p>
              <div className="d-flex align-items-center mb-3">
                <div className="d-flex align-items-center border rounded-pill px-2 me-3">
                  <Button
                    variant="link"
                    className="text-dark p-0 border-0"
                    onClick={() => setDishQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="mx-3 fw-bold">{dishQuantity}</span>
                  <Button
                    variant="link"
                    className="text-dark p-0 border-0"
                    onClick={() => setDishQuantity((q) => q + 1)}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <div className="ms-auto small fw-bold">{(selectedDish.price * dishQuantity).toFixed(2)} ETB</div>
              </div>
              <Button
                className="w-100 rounded-pill py-3 fw-bold border-0 btn-primary-accent"
                onClick={() => {
                  addToCart(selectedDish, restaurantId, dishQuantity)
                  setShowDishModal(false)
                  setDishQuantity(1)
                }}
              >
                ADD {dishQuantity > 1 ? `(${dishQuantity})` : ""} TO ORDER
              </Button>
            </Card.Body>
          </Card>
        )}
      </Modal>
    </div>
  )
}