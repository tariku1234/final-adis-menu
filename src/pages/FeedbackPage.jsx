import { Card, Button, Form } from "react-bootstrap";
import "./FeedbackPage.css";

export default function FeedbackPage() {
  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <header className="feedback-header">
          <h1>We Value Your Feedback</h1>
          <p>Your opinion helps us improve our service.</p>
        </header>

        <Card className="feedback-card">
          <Card.Body>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label>Overall Experience</Form.Label>
                <div className="stars">★ ★ ★ ★ ☆</div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Your Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Tell us about your experience..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name (optional)</Form.Label>
                <Form.Control placeholder="John Doe" />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Phone (optional)</Form.Label>
                <Form.Control placeholder="0912345678" />
              </Form.Group>

              <div className="submit-wrap">
                <Button className="primary-btn">Submit Feedback</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
