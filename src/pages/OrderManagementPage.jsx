"use client"

import { useState, useEffect } from "react"
import { Container, Table, Button, Badge, Card, Nav } from "react-bootstrap"
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore"
import { db } from "../services/firebase.service"
import KitchenManagerNavbar from "../components/KitchenManagerNavbar"

/**
 * OrderManagement Component
 * Displays a real-time kitchen dashboard for managing customer orders.
 */
export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Orders sorted by newest first using Firebase real-time listener
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  /**
   * Updates the status of an order in Firestore
   * @param {string} orderId
   * @param {string} nextStatus
   */
  const updateStatus = async (orderId, nextStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: nextStatus })
    } catch (err) {
      console.error("Update Error:", err)
    }
  }

  // Logic to filter the table display based on the selected status tab
  const filteredOrders = orders.filter((order) => (filter === "all" ? true : order.status === filter))

  return (
    <Container className="py-5">
      <KitchenManagerNavbar />
      <Card className="border-0 shadow-sm" style={{ backgroundColor: "#ffffff", borderRadius: "16px" }}>
        <Card.Body className="p-4">
          {/* DASHBOARD HEADER & FILTER NAVIGATION */}
          <div className="d-md-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-3 mb-md-0" style={{ color: "#004d40" }}>
              Kitchen Dashboard
            </h2>

            <Nav
              variant="pills"
              activeKey={filter}
              onSelect={(k) => setFilter(k)}
              className="bg-light p-1 rounded-pill"
            >
              <Nav.Item>
                <Nav.Link eventKey="all" className="rounded-pill px-3">
                  ALL
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="pending" className="rounded-pill px-3 text-warning-emphasis">
                  PENDING
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="preparing" className="rounded-pill px-3 text-info-emphasis">
                  PREPARING
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed" className="rounded-pill px-3 text-success-emphasis">
                  COMPLETED
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          {/* ORDERS TABLE */}
          <Table responsive hover verticalAlign="middle" className="mb-0">
            <thead style={{ backgroundColor: "#FFFCF7", borderTop: "2px solid #004d40" }}>
              <tr>
                <th className="py-3 border-0">Time</th>
                <th className="py-3 border-0">Order ID</th>
                <th className="py-3 border-0">Items</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 border-0">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <div className="py-3">
                      <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                      No {filter !== "all" ? filter : ""} orders found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {/* COLUMN 1: TIME */}
                    <td className="fw-semibold">
                      {order.createdAt?.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* COLUMN 2: ORDER ID */}
                    <td>
                      <code className="text-muted fw-bold">#{order.id.slice(-5).toUpperCase()}</code>
                    </td>

                    {/* COLUMN 3: ITEMS LIST */}
                    <td>
                      {order.items?.map((item, i) => (
                        <div key={i} className="mb-1 d-flex align-items-center">
                          <Badge bg="light" text="dark" className="border me-2" style={{ minWidth: "35px" }}>
                            {item.quantity}x
                          </Badge>
                          <span style={{ fontSize: "0.95rem" }}>{item.name}</span>
                        </div>
                      ))}
                    </td>

                    {/* COLUMN 4: STATUS BADGE */}
                    <td>
                      <Badge
                        className="px-3 py-2 rounded-pill"
                        bg={order.status === "pending" ? "warning" : order.status === "preparing" ? "info" : "success"}
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* COLUMN 5: ACTION BUTTONS */}
                    <td>
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="rounded-pill px-3"
                          onClick={() => updateStatus(order.id, "preparing")}
                        >
                          Start Cooking
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          size="sm"
                          variant="success"
                          className="rounded-pill px-3 text-white"
                          onClick={() => updateStatus(order.id, "completed")}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === "completed" && (
                        <span className="text-muted small">
                          <i className="bi bi-check-all me-1"></i>Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}
