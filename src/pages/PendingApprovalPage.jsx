"use client"
import { Container, Card, Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import "./PendingApprovalPage.css"

const PendingApprovalPage = () => {
  const navigate = useNavigate()

  return (
    <div className="pending-approval-page">
      <Container>
        <div className="pending-wrapper">
          <Card className="pending-card shadow text-center">
            <Card.Body className="p-5">
              <div className="icon-wrapper mb-4">
                <i className="bi bi-hourglass-split display-1 text-warning"></i>
              </div>
              <h2 className="fw-bold mb-3">Account Pending Approval</h2>
              <p className="text-muted mb-4">
                Thank you for registering! Your account is currently pending approval from our super admin. You will
                receive an email notification once your account has been approved and you can start using the platform.
              </p>
              <div className="info-box mb-4">
                <p className="mb-2">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-start">
                  <li>Our admin team will review your registration</li>
                  <li>You'll receive an email when approved</li>
                  <li>Once approved, you can login and create your restaurant</li>
                </ul>
              </div>
              <Button variant="primary" onClick={() => navigate("/login")} className="px-4">
                Back to Login
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default PendingApprovalPage
