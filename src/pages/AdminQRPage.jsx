"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Button, Card, Spinner, Alert, Form, Badge, Modal } from "react-bootstrap"
import { useAuth } from "../context/AuthContext"
import { getRestaurantById } from "../services/restaurant.service"
import {
  getRestaurantQRCodes,
  generateTableQRCodeBatch,
  deleteRestaurantQRCodes,
  downloadQRCode,
} from "../services/qrcode.service"
import AdminNavbar from "../components/AdminNavbar"
import { QrCode, Download, PlusCircle, Printer, Smartphone, Hash, Trash2, Info } from 'lucide-react'
import "./AdminQRPage.css"

export default function AdminQRPage() {
  const { currentUser } = useAuth()
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [qrCodes, setQrCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [tableCount, setTableCount] = useState(10)

  useEffect(() => {
    const storedRestaurantId = localStorage.getItem("selectedRestaurantId")
    if (storedRestaurantId) {
      setRestaurantId(storedRestaurantId)
      loadQRData(storedRestaurantId)
    } else {
      setError("Please select a restaurant first")
      setLoading(false)
    }
  }, [])

  const loadQRData = async (restId) => {
    setLoading(true)
    const restResult = await getRestaurantById(restId)
    if (restResult.success) setRestaurant(restResult.restaurant)
    
    const qrResult = await getRestaurantQRCodes(restId)
    if (qrResult.success) setQrCodes(qrResult.qrCodes)
    setLoading(false)
  }

  const handleGenerateBatch = async () => {
    if (!restaurant || tableCount < 1) return
    setGenerating(true)
    setError("")
    setSuccess("")
    setShowGenerateModal(false)

    await deleteRestaurantQRCodes(restaurantId)
    const result = await generateTableQRCodeBatch(restaurantId, restaurant.name, tableCount)

    if (result.success) {
      setSuccess(`Successfully generated ${result.totalGenerated} QR codes!`)
      await loadQRData(restaurantId)
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(`Generated ${result.totalGenerated} QR codes, but ${result.totalFailed} failed.`)
    }
    setGenerating(false)
  }

  const handleDownloadPNG = (qrCode) => {
    if (qrCode?.qrCodeDataUrl) {
      downloadQRCode(qrCode.qrCodeDataUrl, `${restaurant.name}-Table-${qrCode.tableNumber}`)
    }
  }

  const handleDownloadAllPDF = async () => {
    if (qrCodes.length === 0) return
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF()

    for (let i = 0; i < qrCodes.length; i++) {
      const qrCode = qrCodes[i]
      if (i > 0) pdf.addPage()
      pdf.setFontSize(22)
      pdf.setTextColor(17, 18, 23) // --text
      pdf.text(restaurant.name.toUpperCase(), 105, 40, { align: "center" })
      pdf.setFontSize(16)
      pdf.text(`TABLE ${qrCode.tableNumber}`, 105, 55, { align: "center" })
      pdf.addImage(qrCode.qrCodeDataUrl, "PNG", 55, 70, 100, 100)
      pdf.setFontSize(10)
      pdf.setTextColor(107, 107, 107) // --muted
      pdf.text("Scan to view menu & order", 105, 180, { align: "center" })
    }
    pdf.save(`${restaurant.name}-QR-Codes.pdf`)
  }

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center public-menu-page">
      <Spinner animation="border" style={{color: 'var(--accent)'}} />
    </div>
  )

  return (
    <div className="public-menu-page min-vh-100">
      <AdminNavbar />
      <Container className="py-5">
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <h2 className="fw-bold mb-1">QR Code Management</h2>
            <p className="text-muted small mb-0">{restaurant?.name} • Table Ordering System</p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button className="btn-primary-accent rounded-pill px-4" onClick={() => setShowGenerateModal(true)} disabled={generating}>
              <PlusCircle size={18} className="me-2" />
              Generate New Batch
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger" className="rounded-4 border-0 shadow-sm">{error}</Alert>}
        {success && <Alert variant="success" className="rounded-4 border-0 shadow-sm">{success}</Alert>}

        {generating ? (
          <div className="text-center py-5">
            <Spinner animation="grow" style={{color: 'var(--accent)'}} />
            <p className="mt-3 fw-bold">Generating secure QR codes...</p>
          </div>
        ) : qrCodes.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-4 shadow-sm border border-light-subtle">
              <div className="d-flex align-items-center">
                <Badge className="bg-dark rounded-pill px-3 py-2 me-3">{qrCodes.length} Active Tables</Badge>
                <span className="small text-muted d-none d-md-inline">All codes link directly to your digital menu.</span>
              </div>
              <Button variant="outline-dark" className="rounded-pill btn-sm px-3 fw-bold" onClick={handleDownloadAllPDF}>
                <Download size={16} className="me-2" /> PDF Print Sheet
              </Button>
            </div>

            <Row className="g-4">
              {qrCodes.sort((a,b) => a.tableNumber - b.tableNumber).map((qrCode) => (
                <Col key={qrCode.id} sm={6} lg={4} xl={3}>
                  <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100 qr-table-card">
                   <div className="qr-header text-center">
    <span className="fw-bold letter-spacing-1">TABLE {qrCode.tableNumber}</span>
  </div>
                    <Card.Body className="text-center d-flex flex-column">
                      <div className="qr-code-preview p-3 mb-3">
                        <img
                          src={qrCode.qrCodeDataUrl || qrCode.qrCodeUrl}
                          alt={`Table ${qrCode.tableNumber}`}
                          className="img-fluid rounded-2"
                        />
                      </div>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                          <small className="text-muted"><Smartphone size={12} className="me-1"/> Scans</small>
                          <span className="fw-bold">{qrCode.scans || 0}</span>
                        </div>
                        <Button 
                          variant="light" 
                          className="w-100 rounded-pill btn-sm fw-bold border"
                          onClick={() => handleDownloadPNG(qrCode)}
                        >
                          <Download size={14} className="me-2"/> PNG
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <Card className="border-0 shadow-sm rounded-4 text-center py-5 px-4">
            <div className="mb-4">
              <div className="qr-placeholder-icon mx-auto">
                <QrCode size={48} />
              </div>
            </div>
            <h3 className="fw-bold">No QR Codes Yet</h3>
            <p className="text-muted mx-auto" style={{maxWidth: '400px'}}>
              Ready to start digital ordering? Generate unique QR codes for your tables so customers can browse and pay from their seats.
            </p>
            <Button className="btn-primary-accent rounded-pill px-5 py-2 mt-3" onClick={() => setShowGenerateModal(true)}>
              Generate My First Batch
            </Button>
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-5 pt-5 border-top">
          <h4 className="fw-bold text-center mb-4">How it works</h4>
          <Row className="g-4">
            {[
              { icon: <Hash />, title: "1. Batch Generate", desc: "Set your total table count and we create unique, tracked links for every seat." },
              { icon: <Printer />, title: "2. Print & Place", desc: "Download the PDF sheet. Print, cut, and place codes on your physical tables." },
              { icon: <Smartphone />, title: "3. Receive Orders", desc: "When scanned, the table number is automatically attached to the customer's order." }
            ].map((step, i) => (
              <Col md={4} key={i}>
                <div className="order-summary h-100 p-4 text-center">
                  <div className="mb-3 text-accent" style={{color: 'var(--accent)'}}>{step.icon}</div>
                  <h6 className="fw-bold">{step.title}</h6>
                  <p className="small text-muted mb-0">{step.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* MODAL */}
      <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)} centered className="rounded-4">
        <Modal.Body className="p-4">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-warning-subtle p-3 rounded-circle me-3 text-warning">
              <QrCode size={24} />
            </div>
            <h4 className="fw-bold mb-0">Setup Tables</h4>
          </div>
          
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">How many tables do you have?</Form.Label>
            <Form.Control
              type="number"
              min="1" max="100"
              className="rounded-3 py-2 shadow-none border-light-subtle"
              value={tableCount}
              onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
            />
            <Form.Text className="text-muted mt-2 d-block small">
              <Info size={12} className="me-1"/> This will generate codes from Table 1 to {tableCount}.
            </Form.Text>
          </Form.Group>

          {qrCodes.length > 0 && (
            <div className="p-3 rounded-3 bg-danger-subtle text-danger small mb-4">
              <Trash2 size={14} className="me-2"/> <strong>Warning:</strong> Generating a new batch will delete your existing {qrCodes.length} QR codes and tracking data.
            </div>
          )}

          <div className="d-flex gap-2">
            <Button variant="light" className="flex-grow-1 rounded-pill fw-bold border" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button className="flex-grow-1 btn-primary-accent rounded-pill fw-bold" onClick={handleGenerateBatch}>
              Generate Batch
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}