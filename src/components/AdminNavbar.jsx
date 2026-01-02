"use client"
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "./AdminNavbar.css"

export default function AdminNavbar() {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate("/login")
    }
  }

  return (
    <Navbar bg="light" variant="light" expand="lg" className="admin-navbar">
      <Container fluid>
        <Navbar.Brand href="/admin/restaurants" className="fw-bold">
          MenuFlow Admin
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="/admin/restaurants">My Restaurants</Nav.Link>
            <Nav.Link href="/admin/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/admin/menu">Menu</Nav.Link>
            <Nav.Link href="/admin/qr">QR Code</Nav.Link>
            <Nav.Link href="/admin/orders">Orders</Nav.Link>

            <NavDropdown
              title={
                <span>
                  <i className="bi bi-person-circle me-2"></i>
                  {userProfile?.fullName || currentUser?.email}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
