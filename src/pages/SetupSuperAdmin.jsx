"use client"

// Temporary page to create the first super admin
// This should be removed or protected after initial setup

import { useState } from "react"
import { Container, Form, Button, Card, Alert } from "react-bootstrap"
import { createFirstSuperAdmin } from "../utils/createSuperAdmin"
import { useNavigate } from "react-router-dom"
import "./SetupSuperAdmin.css"

const SetupSuperAdmin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setLoading(true)

    const result = await createFirstSuperAdmin(formData.email, formData.password, formData.fullName)

    if (result.success) {
      setMessage({
        type: "success",
        text: "Super Admin created successfully! Redirecting to login...",
      })
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } else {
      setMessage({
        type: "danger",
        text: result.error || "Failed to create super admin",
      })
    }

    setLoading(false)
  }

  return (
    <div className="setup-super-admin-page">
      <Container>
        <div className="setup-wrapper">
          <Card className="setup-card shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock display-1 text-primary mb-3"></i>
                <h2 className="fw-bold">Setup Super Admin</h2>
                <p className="text-muted">Create the first super admin account</p>
                <Alert variant="warning" className="text-start mt-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> This page should only be used once to create the initial super admin.
                  Remove or protect this route after setup.
                </Alert>
              </div>

              {message.text && <Alert variant={message.type}>{message.text}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="Enter super admin name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter super admin email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                  <Form.Text className="text-muted">Password must be at least 6 characters long.</Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? "Creating Super Admin..." : "Create Super Admin"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default SetupSuperAdmin
