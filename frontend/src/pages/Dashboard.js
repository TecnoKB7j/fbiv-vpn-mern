import React from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useVPN } from '../contexts/VPNContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { isLoggedIn } = useAuth();
  const { connectionStatus, connectedServer, connectionTime } = useVPN();

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container className="mt-4">
      <h2>📊 Dashboard</h2>
      
      <Row className="dashboard-grid">
        <Col md={3}>
          <div className="metric-card">
            <div className="metric-value">2.5 GB</div>
            <div className="metric-label">Data Used Today</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="metric-card">
            <div className="metric-value">{connectionTime}</div>
            <div className="metric-label">Connected Time</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="metric-card">
            <div className="metric-value">85.4 Mbps</div>
            <div className="metric-label">Download Speed</div>
          </div>
        </Col>
        <Col md={3}>
          <div className="metric-card">
            <div className="metric-value">23.1 Mbps</div>
            <div className="metric-label">Upload Speed</div>
          </div>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📈 Usage Analytics</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                Analytics chart would be displayed here using a charting library like Chart.js or Recharts.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🔒 Connection History</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>{connectedServer?.location || 'No server'}</strong>
                  <small className="text-muted d-block">
                    {connectionStatus === 'connected' ? 'Currently connected' : 'Not connected'}
                  </small>
                </div>
                <span className={`badge ${connectionStatus === 'connected' ? 'bg-success' : 'bg-secondary'}`}>
                  {connectionStatus === 'connected' ? connectionTime : 'Offline'}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;