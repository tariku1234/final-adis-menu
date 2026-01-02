"use client"
import { Container, Card, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import "./UnauthorizedPage.css"

const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className="unauthorized-page">
      <Container>
        <div className="unauthorized-wrapper">
          <Card className="unauthorized-card shadow text-center">
            <Card.Body className="p-5">
              <div className="icon-wrapper mb-4">
                <i className="bi bi-shield-exclamation display-1 text-danger"></i>
              </div>
              <h2 className="fw-bold mb-3">Access Denied</h2>
              <p className="text-muted mb-4">
                You don't have permission to access this page. Please contact your administrator if you believe this is
                an error.
              </p>
              <Button variant="primary" onClick={() => navigate("/")} className="px-4">
                Go to Home
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default UnauthorizedPage
