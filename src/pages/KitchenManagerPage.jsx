"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { updateOrderStatus } from "../services/order.service.js"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "../services/firebase.service"
import KitchenManagerNavbar from "../components/KitchenManagerNavbar"
import "./KitchenManagerPage.css"

export default function KitchenManagerPage() {
  const { userProfile } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (userProfile?.restaurantId) {
      setLoading(true)
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("restaurantId", "==", userProfile.restaurantId), orderBy("createdAt", "desc"))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setOrders(fetchedOrders)
          setLoading(false)
        },
        (err) => {
          console.error("Error listening to orders:", err)
          setError("Failed to load orders in real-time.")
          setLoading(false)
        },
      )

      return () => unsubscribe()
    }
  }, [userProfile?.restaurantId])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      // No need to reload orders since onSnapshot handles real-time updates
    } else {
      setError("Failed to update order: " + result.error)
    }
    setUpdating(null)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>
      case "preparing":
        return <Badge bg="info">Preparing</Badge>
      case "completed":
        return <Badge bg="success">Completed</Badge>
      default:
        return <Badge bg="secondary">{status}</Badge>
    }
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "preparing",
      preparing: "completed",
      completed: null,
    }
    return statusFlow[currentStatus]
  }

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((order) => order.status === filterStatus)

  if (loading) {
    return (
      <>
        <KitchenManagerNavbar />
        <div className="kitchen-root">
          <Container className="py-5 text-center">
            <Spinner animation="border" />
            <p className="mt-3">Loading orders...</p>
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <KitchenManagerNavbar />
      <div className="kitchen-root">
        <Container className="py-5">
          <Row className="mb-4">
            <Col>
              <h1>Kitchen Orders</h1>
              <p>Manage incoming orders for your restaurant</p>
            </Col>
          </Row>

          {error && <Alert variant="danger">{error}</Alert>}

          {/* Filter Tabs */}
          <Row className="mb-4">
            <Col>
              <div className="filter-tabs">
                <Button
                  variant={filterStatus === "all" ? "dark" : "light"}
                  onClick={() => setFilterStatus("all")}
                  className="filter-btn"
                >
                  All Orders ({orders.length})
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "dark" : "light"}
                  onClick={() => setFilterStatus("pending")}
                  className="filter-btn"
                >
                  Pending ({orders.filter((o) => o.status === "pending").length})
                </Button>
                <Button
                  variant={filterStatus === "preparing" ? "dark" : "light"}
                  onClick={() => setFilterStatus("preparing")}
                  className="filter-btn"
                >
                  Preparing ({orders.filter((o) => o.status === "preparing").length})
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "dark" : "light"}
                  onClick={() => setFilterStatus("completed")}
                  className="filter-btn"
                >
                  Completed ({orders.filter((o) => o.status === "completed").length})
                </Button>
              </div>
            </Col>
          </Row>

          {filteredOrders.length === 0 ? (
            <Card className="card-alt text-center">
              <Card.Body className="py-5">
                <h5>No orders found</h5>
                <p className="text-muted">Check back soon for new orders!</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredOrders.map((order) => (
                <Col lg={6} className="mb-4" key={order.id}>
                  <Card className="card-alt order-card">
                    <Card.Body>
                      <div className="order-header mb-3">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="order-id mb-0">Order #{order.id.slice(-6).toUpperCase()}</h6>
                            {order.tableNumber && (
                              <Badge bg="primary" className="table-badge">
                                <i className="bi bi-table me-1"></i>
                                Table {order.tableNumber}
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted">{new Date(order.createdAt?.toDate?.()).toLocaleString()}</small>
                          {order.customerInfo?.name && (
                            <div className="mt-1">
                              <small className="text-muted">
                                <i className="bi bi-person me-1"></i>
                                {order.customerInfo.name}
                              </small>
                            </div>
                          )}
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="order-items mb-3">
                        <h6 className="mb-2">Items:</h6>
                        {order.items && order.items.length > 0 ? (
                          <ul className="items-list">
                            {order.items.map((item, idx) => (
                              <li key={idx}>
                                <span>{item.name || item.itemName}</span>
                                <span className="item-qty">x{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No items specified</p>
                        )}
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="order-notes mb-3">
                          <h6>Notes:</h6>
                          <p className="notes-text">{order.specialInstructions}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      {order.status !== "completed" && getNextStatus(order.status) && (
                        <div className="order-actions">
                          <Button
                            className="btn-update-status"
                            onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status))}
                            disabled={updating === order.id}
                          >
                            {updating === order.id ? (
                              <>
                                <Spinner as="span" animation="border" size="sm" className="me-2" />
                                Updating...
                              </>
                            ) : (
                              `Mark as ${getNextStatus(order.status).charAt(0).toUpperCase() + getNextStatus(order.status).slice(1)}`
                            )}
                          </Button>
                        </div>
                      )}

                      {order.status === "completed" && (
                        <div className="order-completed">
                          <p className="text-success">✓ Order Completed</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </>
  )
}
