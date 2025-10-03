import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Pricing = () => {
  const { isLoggedIn } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await axios.get('/api/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      // Fallback plans
      setPlans([
        {
          name: 'Basic',
          price: 5.99,
          features: ['1 Device', '500GB Data', '10 Countries', 'Basic Support'],
          maxDevices: 1,
          dataLimit: 500,
          countries: 10,
          popular: false
        },
        {
          name: 'Pro',
          price: 9.99,
          features: ['5 Devices', 'Unlimited Data', '30 Countries', 'Premium Support', 'Kill Switch'],
          maxDevices: 5,
          dataLimit: -1,
          countries: 30,
          popular: true
        },
        {
          name: 'Elite',
          price: 14.99,
          features: ['10 Devices', 'Unlimited Data', '60+ Countries', '24/7 Support', 'All Security Features', 'Split Tunneling'],
          maxDevices: 10,
          dataLimit: -1,
          countries: 60,
          popular: false
        }
      ]);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!isLoggedIn) {
      setMessage('Please login to subscribe to a plan');
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setShowPaymentModal(false);
      setMessage(`✅ Successfully subscribed to ${selectedPlan.name} plan! Welcome to FBIV VPN Premium.`);
      setSelectedPlan(null);
    }, 2000);
  };

  const features = [
    {
      icon: '🔐',
      title: 'Military-Grade Security',
      description: 'AES-256 encryption with perfect forward secrecy'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: '10 Gbps servers with unlimited bandwidth'
    },
    {
      icon: '🌍',
      title: 'Global Network',
      description: '500+ servers in 60+ countries worldwide'
    },
    {
      icon: '🛡️',
      title: 'Zero Logs',
      description: 'Strict no-logs policy verified by third parties'
    },
    {
      icon: '📱',
      title: 'All Devices',
      description: 'Windows, Mac, iOS, Android, Linux support'
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Expert support team available around the clock'
    }
  ];

  const comparisons = [
    { feature: 'Servers', basic: '50+', pro: '200+', elite: '500+' },
    { feature: 'Countries', basic: '10', pro: '30', elite: '60+' },
    { feature: 'Simultaneous Devices', basic: '1', pro: '5', elite: '10' },
    { feature: 'Data Transfer', basic: '500GB', pro: 'Unlimited', elite: 'Unlimited' },
    { feature: 'Kill Switch', basic: '❌', pro: '✅', elite: '✅' },
    { feature: 'Split Tunneling', basic: '❌', pro: '❌', elite: '✅' },
    { feature: 'Ad Blocker', basic: '❌', pro: '✅', elite: '✅' },
    { feature: 'Priority Support', basic: '❌', pro: '✅', elite: '✅' },
    { feature: 'P2P Support', basic: '❌', pro: '✅', elite: '✅' },
    { feature: 'Streaming Optimization', basic: '❌', pro: '✅', elite: '✅' }
  ];

  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'We offer a 30-day money-back guarantee on all plans. Try FBIV VPN risk-free!'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept PayPal, credit cards, and cryptocurrencies (Bitcoin, Ethereum) for maximum privacy.'
    },
    {
      question: 'Can I use my subscription on multiple devices?',
      answer: 'Yes! Depending on your plan, you can use FBIV VPN on 1-10 devices simultaneously.'
    }
  ];

  return (
    <Container className="mt-4">
      <div className="text-center mb-5">
        <h1>💎 Choose Your Protection Plan</h1>
        <p className="lead">Get military-grade security with lightning-fast speeds</p>
        <div className="mt-3">
          <Badge bg="success" className="me-2">30-Day Money Back Guarantee</Badge>
          <Badge bg="info" className="me-2">No Setup Fees</Badge>
          <Badge bg="warning">Cancel Anytime</Badge>
        </div>
      </div>

      {message && (
        <Alert variant={message.includes('✅') ? 'success' : 'warning'} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Pricing Plans */}
      <Row className="mb-5">
        {plans.map((plan, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className={`h-100 ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge bg="primary" className="px-3 py-2">Most Popular</Badge>
                </div>
              )}
              <Card.Header className={`text-center ${plan.popular ? 'bg-primary text-white' : 'bg-dark text-white'}`}>
                <h4 className="mb-0">{plan.name}</h4>
                {plan.popular && <small>Best Value</small>}
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <h2 className="display-4">${plan.price}</h2>
                  <small className="text-muted">/month</small>
                </div>
                <ul className="list-unstyled text-start">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.popular ? 'primary' : 'outline-primary'}
                  className="w-100 btn-fbiv"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isLoggedIn ? 'Subscribe Now' : 'Join FBIV VPN'}
                </Button>
                {!isLoggedIn && (
                  <small className="text-muted d-block mt-2">Login required to subscribe</small>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Feature Comparison Table */}
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Header>
              <h5>📊 Detailed Plan Comparison</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th className="text-center">Basic</th>
                      <th className="text-center bg-light">Pro</th>
                      <th className="text-center">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((comp, index) => (
                      <tr key={index}>
                        <td className="fw-bold">{comp.feature}</td>
                        <td className="text-center">{comp.basic}</td>
                        <td className="text-center bg-light">{comp.pro}</td>
                        <td className="text-center">{comp.elite}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Features */}
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-4">
            <h3>🚀 Why Choose FBIV VPN?</h3>
          </div>
          <Row>
            {features.map((feature, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="text-center h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div style={{ fontSize: '3rem' }} className="mb-3">{feature.icon}</div>
                    <h5>{feature.title}</h5>
                    <p className="text-muted">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-4">
            <h3>❓ Frequently Asked Questions</h3>
          </div>
          {faqs.map((faq, index) => (
            <Card key={index} className="mb-3">
              <Card.Header>
                <h6 className="mb-0">{faq.question}</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{faq.answer}</p>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>

      {/* Trust Indicators */}
      <Row className="mb-5">
        <Col>
          <Card className="bg-light">
            <Card.Body className="text-center">
              <Row>
                <Col md={3}>
                  <div className="mb-3">
                    <h4>🔒</h4>
                    <strong>Bank-Level Security</strong>
                    <p className="small text-muted">AES-256 encryption</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <h4>🌟</h4>
                    <strong>Award Winning</strong>
                    <p className="small text-muted">Best VPN 2025</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <h4>👥</h4>
                    <strong>2M+ Users</strong>
                    <p className="small text-muted">Trusted worldwide</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-3">
                    <h4>📞</h4>
                    <strong>24/7 Support</strong>
                    <p className="small text-muted">Always here to help</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
        {selectedPlan && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>Complete Your Subscription</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="text-center mb-4">
                <h5>{selectedPlan.name} Plan</h5>
                <h3>${selectedPlan.price}/month</h3>
                <Badge bg="success">30-Day Money Back Guarantee</Badge>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="paypal">PayPal</option>
                    <option value="card">Credit Card</option>
                    <option value="btc">Bitcoin</option>
                    <option value="eth">Ethereum</option>
                  </Form.Select>
                </Form.Group>

                {paymentMethod === 'paypal' && (
                  <Alert variant="info">
                    <strong>PayPal Payment</strong>
                    <p className="mb-0">You will be redirected to PayPal to complete your payment securely.</p>
                  </Alert>
                )}

                {paymentMethod === 'card' && (
                  <Alert variant="info">
                    <strong>Credit Card Payment</strong>
                    <p className="mb-0">Secure payment processing via Stripe. Your card details are never stored.</p>
                  </Alert>
                )}

                {(paymentMethod === 'btc' || paymentMethod === 'eth') && (
                  <Alert variant="warning">
                    <strong>Cryptocurrency Payment</strong>
                    <p className="mb-0">Pay with crypto for maximum privacy. Payment addresses will be provided after confirmation.</p>
                  </Alert>
                )}
              </Form>

              <div className="mt-4">
                <h6>Plan Features:</h6>
                <ul className="small">
                  {selectedPlan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handlePayment}
                disabled={loading}
                className="btn-fbiv"
              >
                {loading ? 'Processing...' : `Pay $${selectedPlan.price}/month`}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Pricing;