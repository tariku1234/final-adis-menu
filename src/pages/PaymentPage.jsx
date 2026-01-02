import { Container, Card, Button, Accordion } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./PaymentPage.css";

export default function PaymentPage() {
  return (
    <div className="page-root">
      <Container className="py-5">
        {/* Header */}
        <div className="page-header">
          <h1>Complete Your Payment</h1>
          <p>Total Amount: <strong>1250 ETB</strong></p>
        </div>

        {/* Instructions */}
        <Card className="info-card">
          <Card.Body>
            <h5>Important Instructions</h5>
            <p>
              After completing your payment, please show the transaction
              confirmation to your waiter to finalize your order.
            </p>
          </Card.Body>
        </Card>

        {/* Payment Methods */}
        <Accordion defaultActiveKey="0" className="mt-4">
          <PaymentItem
            eventKey="0"
            title="Telebirr"
            value="0912345678"
          />
          <PaymentItem
            eventKey="1"
            title="CBE Birr"
            value="1000098765432"
          />
          <PaymentItem
            eventKey="2"
            title="Dashen Bank"
            value="88990011223344"
          />
          <PaymentItem
            eventKey="3"
            title="PayPal"
            value="payment@gourmet.com"
          />
        </Accordion>

        {/* Actions */}
        <div className="page-actions">
          <Link to="/feedback">
            <Button className="primary-btn">
              Continue to Feedback
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

function PaymentItem({ eventKey, title, value }) {
  return (
    <Accordion.Item eventKey={eventKey} className="payment-accordion">
      <Accordion.Header>{title}</Accordion.Header>
      <Accordion.Body>
        <div className="payment-row">
          <span>{value}</span>
          <Button size="sm" variant="outline-success">
            Copy
          </Button>
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
}
