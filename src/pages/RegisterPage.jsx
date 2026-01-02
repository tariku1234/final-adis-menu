"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Container, Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import "./RegisterPage.css"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signupRestaurantOwner } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match")
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters")
    }

    setLoading(true)

    const result = await signupRestaurantOwner(formData.email, formData.password, {
      fullName: formData.fullName,
      phone: formData.phone,
    })

    if (result.success) {
      navigate("/pending-approval")
    } else {
      setError(result.error || "Failed to create account")
    }

    setLoading(false)
  }

  return (
    <div className="register-page">
      <Container>
        <div className="register-wrapper">
          <Card className="register-card shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Register as Restaurant Owner</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary fw-semibold">
                      Sign In
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  )
}

export default RegisterPage
