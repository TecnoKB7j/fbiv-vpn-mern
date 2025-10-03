import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Security = () => {
  const { user, updateSecuritySettings, isLoggedIn } = useAuth();
  
  const [securitySettings, setSecuritySettings] = useState({
    killSwitch: true,
    splitTunneling: false,
    splitApps: [],
    dnsProtection: true,
    adBlocker: true
  });
  
  const [splitAppsText, setSplitAppsText] = useState('');
  const [dnsLeakResult, setDnsLeakResult] = useState(null);
  const [adsBlocked, setAdsBlocked] = useState(1247);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.securitySettings) {
      setSecuritySettings(user.securitySettings);
      setSplitAppsText(user.securitySettings.splitApps?.join('\n') || '');
    }
  }, [user]);

  const handleSettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!isLoggedIn) {
      setMessage('Please login to save security settings');
      return;
    }
    
    setLoading(true);
    const settingsToSave = {
      ...securitySettings,
      splitApps: splitAppsText.split('\n').filter(app => app.trim() !== '')
    };
    
    const result = await updateSecuritySettings(settingsToSave);
    
    if (result.success) {
      setMessage('Security settings saved successfully!');
    } else {
      setMessage(`Failed to save settings: ${result.message}`);
    }
    
    setLoading(false);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const testDNSLeak = async () => {
    setDnsLeakResult({ testing: true });
    
    // Simulate DNS leak test
    setTimeout(() => {
      const isSafe = Math.random() > 0.2;
      setDnsLeakResult({
        safe: isSafe,
        message: isSafe 
          ? '✅ No DNS leaks detected. Your DNS requests are properly protected.' 
          : '⚠️ Potential DNS leak detected. Please check your network configuration.',
        details: {
          dnsServers: isSafe 
            ? ['8.8.8.8 (Google)', '1.1.1.1 (Cloudflare)']
            : ['192.168.1.1 (ISP)', '8.8.8.8 (Google)'],
          leakDetected: !isSafe
        }
      });
    }, 2000);
  };

  const securityFeatures = [
    {
      icon: '🚨',
      title: 'Kill Switch',
      description: 'Automatically disconnect internet if VPN connection drops',
      setting: 'killSwitch',
      enabled: securitySettings.killSwitch
    },
    {
      icon: '🔀',
      title: 'Split Tunneling',
      description: 'Choose which apps use VPN connection',
      setting: 'splitTunneling',
      enabled: securitySettings.splitTunneling
    },
    {
      icon: '🛡️',
      title: 'DNS Leak Protection',
      description: 'Prevent DNS requests from leaking outside VPN tunnel',
      setting: 'dnsProtection',
      enabled: securitySettings.dnsProtection
    },
    {
      icon: '🚫',
      title: 'Ad Blocker',
      description: 'Block ads, trackers, and malicious websites',
      setting: 'adBlocker',
      enabled: securitySettings.adBlocker
    }
  ];

  const advancedFeatures = [
    { icon: '🔐', title: 'AES-256 Encryption', description: 'Military-grade encryption standard', enabled: true },
    { icon: '🔄', title: 'Perfect Forward Secrecy', description: 'New encryption keys for each session', enabled: true },
    { icon: '🛡️', title: 'DDoS Protection', description: 'Protects against distributed denial of service attacks', enabled: true },
    { icon: '🔒', title: 'Zero-Log Policy', description: 'No activity logs stored on our servers', enabled: true },
    { icon: '🌐', title: 'IPv6 Leak Protection', description: 'Prevents IPv6 address leaks', enabled: true },
    { icon: '⚡', title: 'Automatic Reconnection', description: 'Automatically reconnects if connection drops', enabled: true }
  ];

  return (
    <Container className="mt-4">
      <h2>🛡️ Advanced Security</h2>
      
      {message && (
        <Alert variant={message.includes('success') ? 'success' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}
      
      {/* Core Security Features */}
      <Row>
        {securityFeatures.map((feature, index) => (
          <Col md={6} key={index} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex align-items-center">
                <span className="me-2" style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                <h5 className="mb-0">{feature.title}</h5>
              </Card.Header>
              <Card.Body>
                <p>{feature.description}</p>
                <Form.Check 
                  type="switch"
                  id={`switch-${feature.setting}`}
                  label={`Enable ${feature.title}`}
                  checked={feature.enabled}
                  onChange={(e) => handleSettingChange(feature.setting, e.target.checked)}
                  className="mb-3"
                />
                
                {/* Split Tunneling Apps */}
                {feature.setting === 'splitTunneling' && securitySettings.splitTunneling && (
                  <Form.Group>
                    <Form.Label>Apps to route through VPN (one per line):</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={splitAppsText}
                      onChange={(e) => setSplitAppsText(e.target.value)}
                      placeholder="Chrome&#10;Steam&#10;Discord&#10;Torrent Client"
                    />
                  </Form.Group>
                )}
                
                {/* DNS Leak Test */}
                {feature.setting === 'dnsProtection' && (
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={testDNSLeak}
                      disabled={dnsLeakResult?.testing}
                    >
                      {dnsLeakResult?.testing ? 'Testing...' : 'Test DNS Leak'}
                    </Button>
                    
                    {dnsLeakResult && !dnsLeakResult.testing && (
                      <Alert 
                        variant={dnsLeakResult.safe ? 'success' : 'warning'} 
                        className="mt-2"
                      >
                        <div>{dnsLeakResult.message}</div>
                        {dnsLeakResult.details && (
                          <div className="mt-2 small">
                            <strong>DNS Servers:</strong>
                            <ul className="mb-0 mt-1">
                              {dnsLeakResult.details.dnsServers.map((server, i) => (
                                <li key={i}>{server}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Alert>
                    )}
                  </div>
                )}
                
                {/* Ad Blocker Stats */}
                {feature.setting === 'adBlocker' && securitySettings.adBlocker && (
                  <div className="mt-2">
                    <Badge bg="success">Blocked today: {adsBlocked.toLocaleString()} ads</Badge>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Advanced Security Features */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5>🔐 Advanced Security Features</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {advancedFeatures.map((feature, index) => (
                  <Col md={4} key={index} className="mb-3">
                    <div className="d-flex align-items-center p-3 border rounded">
                      <span className="me-3" style={{ fontSize: '1.5rem' }}>{feature.icon}</span>
                      <div className="flex-grow-1">
                        <div className="fw-bold">{feature.title}</div>
                        <div className="small text-muted">{feature.description}</div>
                      </div>
                      <Badge bg={feature.enabled ? 'success' : 'secondary'}>
                        {feature.enabled ? '✅' : '❌'}
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Threat Protection */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>🛡️ Threat Protection</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Malware Blocked</span>
                  <Badge bg="danger">47 threats</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Trackers Blocked</span>
                  <Badge bg="warning">{adsBlocked} trackers</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Phishing Attempts</span>
                  <Badge bg="info">3 blocked</Badge>
                </div>
              </div>
              <Alert variant="success">
                <strong>Security Status:</strong> All protection systems active
              </Alert>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📊 Security Analytics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Encryption Strength</span>
                  <Badge bg="success">AES-256</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Protocol</span>
                  <Badge bg="info">OpenVPN</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Connection Security</span>
                  <Badge bg="success">Perfect</Badge>
                </div>
              </div>
              <Alert variant="info">
                Your connection is using the highest security standards available.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Save Settings */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body className="text-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleSaveSettings}
                disabled={loading || !isLoggedIn}
                className="btn-fbiv"
              >
                {loading ? 'Saving...' : 'Save Security Settings'}
              </Button>
              {!isLoggedIn && (
                <div className="mt-2 text-muted">
                  Please login to save your security preferences
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Security;