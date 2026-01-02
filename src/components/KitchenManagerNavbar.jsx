"use client"
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import "./AdminNavbar.css"

export default function KitchenManagerNavbar() {
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      navigate("/login")
    }
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
      <Container fluid>
        <Navbar.Brand href="/kitchen/orders" className="fw-bold">
          MenuFlow Kitchen
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="kitchen-navbar-nav" />
        <Navbar.Collapse id="kitchen-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link href="/kitchen/orders">Orders</Nav.Link>

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
