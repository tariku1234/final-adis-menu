"use client"


import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form } from "react-bootstrap"
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "../services/firebase.service"
import { useAuth } from "../context/AuthContext"
import "./SuperAdminDashboard.css"

const SuperAdminDashboard = () => {
  const { logout } = useAuth()
  const [pendingOwners, setPendingOwners] = useState([])
  const [approvedOwners, setApprovedOwners] = useState([])
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState({
    plan: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  })

  useEffect(() => {
    fetchRestaurantOwners()
  }, [])

  const fetchRestaurantOwners = async () => {
    try {
      // *** CHANGE START HERE ***
      // Query the 'users' collection instead of 'restaurant_owners'
      const usersRef = collection(db, "users")

      // Fetch pending restaurant owners
      const pendingQuery = query(
        usersRef,
        where("role", "==", "restaurant_owner"), // Filter by role
        where("status", "==", "pending")
      )
      const pendingSnapshot = await getDocs(pendingQuery)
      const pending = pendingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPendingOwners(pending)

      // Fetch approved restaurant owners
      const approvedQuery = query(
        usersRef,
        where("role", "==", "restaurant_owner"), // Filter by role
        where("status", "==", "active")
      )
      const approvedSnapshot = await getDocs(approvedQuery)
      const approved = approvedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setApprovedOwners(approved)
      // *** CHANGE END HERE ***

    } catch (error) {
      console.error("Error fetching owners:", error)
    }
  }

  const handleApproveOwner = async (ownerId) => {
    setSelectedOwner(ownerId)
    setShowSubscriptionModal(true)
  }

  const handleSubscriptionSubmit = async () => {
    try {
      // *** CHANGE START HERE ***
      // Update the user document in the 'users' collection
      const ownerRef = doc(db, "users", selectedOwner)
      // *** CHANGE END HERE ***

      await updateDoc(ownerRef, {
        status: "active",
        subscription: {
          plan: subscriptionData.plan,
          startDate: subscriptionData.startDate,
          endDate: subscriptionData.endDate,
          status: "active",
        },
      })

      setShowSubscriptionModal(false)
      fetchRestaurantOwners()
    } catch (error) {
      console.error("Error approving owner:", error)
    }
  }

  const handleRejectOwner = async (ownerId) => {
    if (window.confirm("Are you sure you want to reject this owner?")) {
      try {
        // *** CHANGE START HERE ***
        // Update the user document in the 'users' collection
        const ownerRef = doc(db, "users", ownerId)
        // *** CHANGE END HERE ***
        await updateDoc(ownerRef, {
          status: "rejected",
        })
        fetchRestaurantOwners()
      } catch (error) {
        console.error("Error rejecting owner:", error)
      }
    }
  }


  return (
    <div className="super-admin-dashboard">
      <div className="admin-header bg-primary text-white py-3">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Super Admin Dashboard</h2>
            <Button variant="light" onClick={logout}>
              Logout
            </Button>
          </div>
        </Container>
      </div>

      <Container className="my-4">
        <Row className="mb-4">
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h5>Pending Approvals</h5>
                <h2 className="text-warning">{pendingOwners.length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h5>Active Owners</h5>
                <h2 className="text-success">{approvedOwners.length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="stat-card">
              <Card.Body>
                <h5>Total Revenue</h5>
                <h2 className="text-primary">$0</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Pending Approvals</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOwners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  pendingOwners.map((owner) => (
                    <tr key={owner.id}>
                      <td>{owner.fullName}</td>
                      <td>{owner.email}</td>
                      <td>{owner.phone}</td>
                      <td>
                        <Badge bg="warning">Pending</Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleApproveOwner(owner.id)}
                        >
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleRejectOwner(owner.id)}>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h5 className="mb-0">Active Restaurant Owners</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subscription</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedOwners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No active owners
                    </td>
                  </tr>
                ) : (
                  approvedOwners.map((owner) => (
                    <tr key={owner.id}>
                      <td>{owner.fullName}</td>
                      <td>{owner.email}</td>
                      <td>{owner.phone}</td>
                      <td>
                        {owner.subscription ? (
                          <Badge bg="info">{owner.subscription.plan}</Badge>
                        ) : (
                          <Badge bg="secondary">None</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg="success">Active</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Subscription Modal */}
      <Modal show={showSubscriptionModal} onHide={() => setShowSubscriptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Set Subscription Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subscription Plan</Form.Label>
              <Form.Select
                value={subscriptionData.plan}
                onChange={(e) => setSubscriptionData({ ...subscriptionData, plan: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={subscriptionData.startDate}
                onChange={(e) => setSubscriptionData({ ...subscriptionData, startDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={subscriptionData.endDate}
                onChange={(e) => setSubscriptionData({ ...subscriptionData, endDate: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubscriptionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubscriptionSubmit}>
            Approve & Set Subscription
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default SuperAdminDashboard
