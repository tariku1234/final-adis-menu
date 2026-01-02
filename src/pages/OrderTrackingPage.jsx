"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Card, Badge, Spinner, Alert, Button, ListGroup } from "react-bootstrap"
import { onSnapshot, doc } from "firebase/firestore"
import { db } from "../services/firebase.service"
import "./OrderTrackingPage.css"

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided")
      setLoading(false)
      return
    }

    const orderRef = doc(db, "orders", orderId)

    const unsubscribe = onSnapshot(
      orderRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setOrder({ id: docSnapshot.id, ...docSnapshot.data() })
          setLoading(false)
        } else {
          setError("Order not found")
          setLoading(false)
        }
      },
      (err) => {
        console.error("Error fetching order:", err)
        setError("Failed to load order")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [orderId])

  const getStatusStep = (status) => {
    const steps = { pending: 1, preparing: 2, completed: 3 }
    return steps[status] || 0
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Order Received",
      preparing: "Being Prepared",
      completed: "Ready!",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Container>
          <Alert variant="danger" className="text-center">
            <Alert.Heading>Order Not Found</Alert.Heading>
            <p>{error || "We couldn't find your order."}</p>
            <Button variant="primary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </Alert>
        </Container>
      </div>
    )
  }

  const currentStep = getStatusStep(order.status)

  return (
    <div className="order-tracking-page min-vh-100 bg-light py-5">
      <Container>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="mb-2">Order Tracking</h2>
              <p className="text-muted">Order #{order.id.slice(-8).toUpperCase()}</p>
              {order.tableNumber && (
                <Badge bg="primary" className="px-3 py-2 mb-2">
                  <i className="bi bi-table me-2"></i>
                  Table {order.tableNumber}
                </Badge>
              )}
              {order.customerInfo && (
                <p className="text-muted mb-0">
                  <strong>{order.customerInfo.name}</strong>
                </p>
              )}
            </div>

            {/* Order Status Stepper */}
            <div className="order-status-stepper mb-4">
              <div className="stepper-wrapper">
                <div className={`stepper-item ${currentStep >= 1 ? "active" : ""}`}>
                  <div className="stepper-circle">{currentStep > 1 ? <i className="bi bi-check"></i> : "1"}</div>
                  <div className="stepper-label">Order Received</div>
                </div>
                <div className={`stepper-line ${currentStep >= 2 ? "active" : ""}`}></div>
                <div className={`stepper-item ${currentStep >= 2 ? "active" : ""}`}>
                  <div className="stepper-circle">{currentStep > 2 ? <i className="bi bi-check"></i> : "2"}</div>
                  <div className="stepper-label">Being Prepared</div>
                </div>
                <div className={`stepper-line ${currentStep >= 3 ? "active" : ""}`}></div>
                <div className={`stepper-item ${currentStep >= 3 ? "active" : ""}`}>
                  <div className="stepper-circle">{currentStep >= 3 ? <i className="bi bi-check"></i> : "3"}</div>
                  <div className="stepper-label">Ready!</div>
                </div>
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="text-center mb-4">
              <Badge
                bg={order.status === "completed" ? "success" : order.status === "preparing" ? "info" : "warning"}
                className="px-4 py-2 fs-6"
              >
                {getStatusLabel(order.status)}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="order-details">
              <h5 className="mb-3">Order Items</h5>
              <ListGroup variant="flush">
                {order.items &&
                  order.items.map((item, idx) => (
                    <ListGroup.Item
                      key={idx}
                      className="d-flex justify-content-between align-items-center border-0 px-0"
                    >
                      <div>
                        <h6 className="mb-0">{item.name}</h6>
                        <small className="text-muted">Quantity: {item.quantity}</small>
                      </div>
                      <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <h5 className="mb-0">Total</h5>
                <h5 className="mb-0 text-primary">${order.totalAmount?.toFixed(2) || "0.00"}</h5>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 text-center">
              {order.status === "completed" ? (
                <Alert variant="success" className="mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  {order.tableNumber
                    ? `Your order for Table ${order.tableNumber} is ready! Please collect it from the counter.`
                    : "Your order is ready! Please collect it from the counter."}
                </Alert>
              ) : (
                <Alert variant="info" className="mb-3">
                  <i className="bi bi-clock me-2"></i>
                  We'll notify you when your order status changes.
                </Alert>
              )}
              <Button variant="outline-primary" onClick={() => navigate(`/menu/${order.restaurantId}`)}>
                Back to Menu
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
