import React, { useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useVPN } from '../contexts/VPNContext';

const Home = () => {
  const { 
    globalStats, 
    loadGlobalStats, 
    connectToServer, 
    connectionStatus 
  } = useVPN();

  useEffect(() => {
    loadGlobalStats();
  }, []);

  const handleQuickConnect = async (server) => {
    const result = await connectToServer(server);
    if (result.success) {
      alert(`✅ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const features = [
    {
      icon: '🔐',
      title: 'Military-Grade Encryption',
      description: 'AES-256 encryption with perfect forward secrecy. Your data is unbreakable.',
      features: ['ChaCha20 cipher', 'RSA-4096 handshake', 'SHA-384 authentication']
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Speeds',
      description: 'Optimized for streaming, gaming, and large downloads without slowdowns.',
      features: ['10 Gbps servers', 'Smart routing', 'Bandwidth unlimited']
    },
    {
      icon: '🌍',
      title: 'Global Access',
      description: 'Bypass geo-restrictions and access content from anywhere in the world.',
      features: ['60+ countries', '500+ servers', 'Smart location']
    }
  ];

  const securityFeatures = [
    { icon: '🛡️', title: 'Kill Switch', description: 'Automatic protection if VPN drops' },
    { icon: '🔄', title: 'Split Tunneling', description: 'Choose which apps use VPN' },
    { icon: '🚫', title: 'Ad Blocker', description: 'Block ads and trackers' },
    { icon: '🔒', title: 'DNS Protection', description: 'Prevent DNS leaks' }
  ];

  const testimonials = [
    {
      rating: '⭐⭐⭐⭐⭐',
      text: 'FBIV VPN is incredibly fast and reliable. I can stream 4K content without any buffering!',
      author: 'Sarah M.',
      role: 'Netflix Enthusiast'
    },
    {
      rating: '⭐⭐⭐⭐⭐',
      text: 'Perfect for gaming. Low latency and no disconnects. My ping is actually better with FBIV!',
      author: 'Alex K.',
      role: 'Pro Gamer'
    },
    {
      rating: '⭐⭐⭐⭐⭐',
      text: 'As a journalist, privacy is crucial. FBIV VPN keeps my sources and data completely secure.',
      author: 'Maria R.',
      role: 'Investigative Reporter'
    }
  ];

  const faqs = [
    {
      question: 'How does FBIV VPN protect my privacy?',
      answer: 'We use military-grade AES-256 encryption and maintain a strict no-logs policy. Your data is never stored, tracked, or shared with anyone.'
    },
    {
      question: 'Can I use FBIV VPN for streaming?',
      answer: 'Absolutely! Our servers are optimized for streaming services like Netflix, Disney+, and more. Enjoy 4K content without buffering.'
    },
    {
      question: 'How many devices can I connect?',
      answer: 'Depending on your plan, you can connect 1-10 devices simultaneously. All your devices stay protected under one account.'
    }
  ];

  return (
    <Container className="mt-4">
      {/* Hero Section */}
      <div className="hero">
        <h1>FBIV VPN</h1>
        <p className="lead">Fast • Bulletproof • Invisible</p>
        <p>Military-grade encryption meets lightning-fast speeds. Protect your digital life with the world's most advanced VPN.</p>
        <div className="mt-4">
          <Button as={Link} to="/pricing" variant="success" size="lg" className="me-3">
            🔐 Get Protected Now
          </Button>
          <Button as={Link} to="/speedtest" variant="outline-light" size="lg">
            ⚡ Test Speed
          </Button>
        </div>
        
        {/* Live Stats */}
        <Row className="mt-5 text-center">
          <Col md={3}>
            <div className="stat-item">
              <div className="stat-number">{globalStats.totalUsers?.toLocaleString() || '2,847,392'}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-item">
              <div className="stat-number">{globalStats.totalServers || '520'}</div>
              <div className="stat-label">Global Servers</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-item">
              <div className="stat-number">{globalStats.totalCountries || '60'}+</div>
              <div className="stat-label">Countries</div>
            </div>
          </Col>
          <Col md={3}>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Real-time Server Status */}
      <div className="section-header mt-5">
        <h2>🌍 Real-time Global Network</h2>
        <p>Our servers are online and ready to protect you</p>
      </div>
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>🚀 Fastest Servers Right Now</h5>
              <Button variant="outline-primary" size="sm" onClick={loadGlobalStats}>
                🔄 Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="server-quick-list">
                {globalStats.topServers?.map((server, index) => (
                  <div key={index} className="server-quick-item" onClick={() => handleQuickConnect(server)}>
                    <div className="server-flag">{server.flag || '🌍'}</div>
                    <div className="server-info">
                      <strong>{server.location}</strong>
                      <small className="text-muted d-block">{server.ping}ms • {server.load}% load</small>
                    </div>
                    <div className="server-status">
                      <span className={`status-dot ${server.load < 40 ? 'excellent' : server.load < 70 ? 'good' : 'busy'}`}></span>
                      <small>{server.load < 40 ? 'Excellent' : server.load < 70 ? 'Good' : 'Busy'}</small>
                    </div>
                    <Button 
                      variant="success" 
                      size="sm" 
                      disabled={connectionStatus === 'connecting'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickConnect(server);
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card style={{ cursor: 'pointer' }}>
            <Card.Header>
              <h5>📊 Network Health</h5>
              <small className="text-muted">Live statistics</small>
            </Card.Header>
            <Card.Body>
              <div className="network-metric">
                <div className="metric-label">Average Speed</div>
                <div className="metric-value text-success">{globalStats.networkStats?.avgSpeed || '85.4'} Mbps</div>
              </div>
              <div className="network-metric">
                <div className="metric-label">Global Load</div>
                <div className={`metric-value ${globalStats.networkStats?.globalLoad < 40 ? 'text-success' : globalStats.networkStats?.globalLoad < 70 ? 'text-warning' : 'text-danger'}`}>
                  {globalStats.networkStats?.globalLoad || '34'}%
                </div>
              </div>
              <div className="network-metric">
                <div className="metric-label">Active Connections</div>
                <div className="metric-value text-info">{globalStats.networkStats?.activeConnections?.toLocaleString() || '847,392'}</div>
              </div>
              <div className="network-metric">
                <div className="metric-label">Data Protected</div>
                <div className="metric-value text-primary">{globalStats.networkStats?.dataProtected || '2,847'} TB</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Feature Showcase */}
      <div className="section-header mt-5">
        <h2>🛡️ Why Choose FBIV VPN?</h2>
        <p>Advanced features that keep you safe and connected</p>
      </div>
      
      <Row className="mt-4">
        {features.map((feature, index) => (
          <Col md={4} key={index}>
            <div className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h5>{feature.title}</h5>
              <p>{feature.description}</p>
              <ul className="feature-list">
                {feature.features.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Button variant="outline-primary" size="sm" className="mt-3">
                Learn More
              </Button>
            </div>
          </Col>
        ))}
      </Row>

      {/* Security Features Grid */}
      <Row className="mt-4">
        {securityFeatures.map((feature, index) => (
          <Col md={3} key={index}>
            <div className="security-feature">
              <div className="security-icon">{feature.icon}</div>
              <h6>{feature.title}</h6>
              <p>{feature.description}</p>
              <small className="text-primary">Click to configure →</small>
            </div>
          </Col>
        ))}
      </Row>

      {/* Testimonials */}
      <div className="section-header mt-5">
        <h2>💬 What Users Say</h2>
        <p>Join millions of satisfied customers worldwide</p>
      </div>
      
      <Row>
        {testimonials.map((testimonial, index) => (
          <Col md={4} key={index}>
            <div className="testimonial-card">
              <div className="testimonial-rating">{testimonial.rating}</div>
              <p>"{testimonial.text}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.author}</strong>
                <small>{testimonial.role}</small>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* FAQ Section */}
      <div className="section-header mt-5">
        <h2>❓ Frequently Asked Questions</h2>
      </div>
      
      <div className="faq-container">
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
      </div>

      {/* Trust Indicators */}
      <div className="section-header mt-5">
        <h2>🏆 Trusted Worldwide</h2>
      </div>
      
      <Row className="trust-indicators">
        <Col md={3}>
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <h6>SOC 2 Certified</h6>
            <p>Independently audited security</p>
            <small className="text-primary">View certificate →</small>
          </div>
        </Col>
        <Col md={3}>
          <div className="trust-item">
            <div className="trust-icon">🛡️</div>
            <h6>No-Log Policy</h6>
            <p>Verified by third parties</p>
            <small className="text-primary">Read policy →</small>
          </div>
        </Col>
        <Col md={3}>
          <div className="trust-item">
            <div className="trust-icon">🌟</div>
            <h6>Award Winning</h6>
            <p>Best VPN 2025</p>
            <small className="text-primary">View awards →</small>
          </div>
        </Col>
        <Col md={3}>
          <div className="trust-item">
            <div className="trust-icon">💚</div>
            <h6>Open Source</h6>
            <p>Transparent code</p>
            <small className="text-primary">View source →</small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;