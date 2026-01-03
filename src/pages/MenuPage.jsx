"use client"
import { Container, Row, Col, Card, Navbar, Nav } from "react-bootstrap"
import logo from "../img/addisMenu.jpg"
import foodImage from "../img/menu.jpg"
import "./MenuPage.css"

export default function MenuPage() {
  return (
    <div className="menu-root">
      {/* ===== TOP NAVBAR ===== */}
      <Navbar expand="lg" className="menu-navbar sticky-top">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
            <div className="logo-box">
              <img
                src={logo || "/placeholder.svg"}
                alt="Addis Menu"
                style={{ width: "40px", height: "40px", borderRadius: "4px" }}
              />
            </div>
            Addis Menu
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#about" className="text-dark">
              About
            </Nav.Link>
            <Nav.Link href="#contact" className="text-dark">
              Contact
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* ===== HERO SECTION ===== */}
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${foodImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="hero-overlay">
          <Container>
            <div className="text-center hero-content">
              <h1 className="hero-title">Addis Menu</h1>
              <p className="hero-subtitle">Digital Menus Made Simple</p>
            </div>
          </Container>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="about-section py-5">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={6}>
              <img
                src={logo || "/placeholder.svg"}
                alt="Addis Menu"
                className="img-fluid rounded-4 shadow"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Col>
            <Col lg={6}>
              <h2 className="section-title fw-bold mb-4">About Addis Menu</h2>
              <p className="lead text-muted mb-3">
                Addis Menu is your gateway to seamless digital dining experiences. We empower restaurants to share their
                menus with customers effortlessly.
              </p>
              <p className="text-muted mb-3">
                With our intuitive platform, restaurant owners can create, manage, and share their digital menus through
                QR codes. Customers can browse menus, place orders, and track their meals in real-time.
              </p>
              <h5 className="fw-bold mt-5 mb-3">Why Choose Addis Menu?</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="bi bi-check2-circle text-accent me-2"></i> <strong>Easy Setup</strong> - Create your
                  digital menu in minutes
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2-circle text-accent me-2"></i> <strong>QR Code Generation</strong> - Share
                  menus instantly with customers
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2-circle text-accent me-2"></i> <strong>Real-time Orders</strong> - Manage
                  orders efficiently
                </li>
                <li className="mb-2">
                  <i className="bi bi-check2-circle text-accent me-2"></i> <strong>Beautiful Design</strong> -
                  Professional menus that impress customers
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold">Our Features</h2>
            <p className="text-muted">Everything you need to run a successful digital menu</p>
          </div>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-qr-code text-accent" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold mb-2">QR Menus</h5>
                <p className="small text-muted">Generate unique QR codes for easy menu sharing</p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-cart3 text-accent" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Order Management</h5>
                <p className="small text-muted">Accept and manage orders from customers</p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-graph-up text-accent" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Analytics</h5>
                <p className="small text-muted">Track scans, views, and customer engagement</p>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm text-center p-4">
                <div className="feature-icon mb-3">
                  <i className="bi bi-shield-check text-accent" style={{ fontSize: "2rem" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Secure & Reliable</h5>
                <p className="small text-muted">Your data is protected with enterprise security</p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section py-5">
        <Container>
          <div className="text-center">
            <h2 className="fw-bold mb-4">Ready to Get Started?</h2>
            <p className="lead text-muted mb-4">Join hundreds of restaurants using Addis Menu</p>
            <Row className="g-3 justify-content-center">
              <Col auto>
                <a href="/register" className="btn btn-lg btn-accent rounded-pill px-5 fw-bold">
                  Get Started
                </a>
              </Col>
              <Col auto>
                <a href="/login" className="btn btn-lg btn-outline-accent rounded-pill px-5 fw-bold">
                  Sign In
                </a>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="contact" className="menu-footer">
        <Container>
          <Row className="g-4 mb-5">
            <Col md={4}>
              <h6 className="fw-bold mb-3">About</h6>
              <p className="small text-muted mb-0">
                Addis Menu makes digital dining simple for restaurants and customers.
              </p>
            </Col>
            <Col md={4}>
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#about" className="text-muted text-decoration-none small">
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/register" className="text-muted text-decoration-none small">
                    Register
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-muted text-decoration-none small">
                    Sign In
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={4}>
              <h6 className="fw-bold mb-3">Contact</h6>
              <p className="small text-muted mb-1">Email: info@addismenu.com</p>
              <p className="small text-muted mb-0">Phone: +251 912 345 678</p>
            </Col>
          </Row>
          <div className="border-top pt-4 text-center">
            <p className="mb-2">
              <strong>Addis Menu</strong>
            </p>
            <p className="small text-muted mt-3">Powered by MenuFlow | &copy; 2026 All Rights Reserved</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
