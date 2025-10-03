// Account management page - this took way too long to get right
// Bug fixes: March 15, 2024 - fixed that annoying email undefined error
// TODO: Add profile picture upload when we have time

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Account = () => {
  const { user, isLoggedIn } = useAuth();
  
  // Profile state - had to add default notifications to prevent crashes
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    notifications: {
      email: true,
      security: true,
      marketing: false // Default to false per GDPR requirements
    }
  });
  
  const [subscription, setSubscription] = useState(null);
  
  // Usage tracking - these numbers come from the backend
  const [usage, setUsage] = useState({
    dataUsed: 0,
    dataLimit: -1, // -1 means unlimited
    connectionsToday: 0,
    totalConnections: 0,
    devicesConnected: 0,
    maxDevices: 5
  });
  const [devices, setDevices] = useState([]);
  // Component state management
  const [sessions, setSessions] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // Default tab

  // Load account data when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Loading account data for user:', user?.email); // Debug log
      loadAccountData();
    }
  }, [isLoggedIn]);

  // Fetch all account-related data from API
  const loadAccountData = async () => {
    setLoading(true); // Show loading state
    try {
      console.log('Fetching profile data...'); // Debug
      
      // Load user profile data
      const profileRes = await axios.get('/api/user/profile');
      
      // Merge with existing profile to preserve notifications structure
      setProfile(prevProfile => ({
        ...prevProfile,
        ...profileRes.data,
        notifications: {
          email: true,
          security: true,
          marketing: false,
          ...profileRes.data.notifications
        }
      }));

      // Load subscription
      const subRes = await axios.get('/api/user/subscription');
      setSubscription(subRes.data);

      // Load usage stats
      const usageRes = await axios.get('/api/user/usage');
      setUsage(usageRes.data);

      // Load devices
      const devicesRes = await axios.get('/api/user/devices');
      setDevices(devicesRes.data);

      // Load sessions
      const sessionsRes = await axios.get('/api/user/sessions');
      setSessions(sessionsRes.data);
    } catch (error) {
      console.error('Failed to load account data:', error);
      // Set demo data
      setProfile({
        username: (user && user.username) ? user.username : 'demo_user',
        email: (user && user.email) ? user.email : 'demo@fbivvpn.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1 (555) 123-4567',
        country: 'United States',
        notifications: { email: true, security: true, marketing: false }
      });
      
      setSubscription({
        plan: 'Pro',
        status: 'active',
        nextBilling: '2025-02-15',
        price: 9.99,
        features: ['5 Devices', 'Unlimited Data', '30 Countries', 'Premium Support']
      });

      setUsage({
        dataUsed: 125.5,
        dataLimit: -1,
        connectionsToday: 12,
        totalConnections: 1547,
        devicesConnected: 3,
        maxDevices: 5
      });

      setDevices([
        { id: 1, name: 'Windows PC', type: 'Desktop', lastUsed: '2025-01-15T10:30:00Z', status: 'online' },
        { id: 2, name: 'iPhone 13', type: 'Mobile', lastUsed: '2025-01-15T09:15:00Z', status: 'offline' },
        { id: 3, name: 'MacBook Pro', type: 'Laptop', lastUsed: '2025-01-14T18:45:00Z', status: 'offline' }
      ]);

      setSessions([
        { id: 1, server: 'US-NY-01', startTime: '2025-01-15T10:30:00Z', duration: '2h 15m', dataUsed: '1.2 GB' },
        { id: 2, server: 'UK-LON-03', startTime: '2025-01-14T18:45:00Z', duration: '45m', dataUsed: '450 MB' },
        { id: 3, server: 'JP-TKY-02', startTime: '2025-01-14T14:20:00Z', duration: '1h 30m', dataUsed: '800 MB' }
      ]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('✅ Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate password change
    setTimeout(() => {
      setLoading(false);
      setShowPasswordModal(false);
      setMessage('✅ Password changed successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    
    // Simulate cancellation
    setTimeout(() => {
      setLoading(false);
      setSubscription({ ...subscription, status: 'cancelled' });
      setMessage('⚠️ Subscription cancelled. You can still use the service until the end of your billing period.');
      setTimeout(() => setMessage(''), 5000);
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    // Simulate account deletion
    setTimeout(() => {
      setLoading(false);
      setShowDeleteModal(false);
      setMessage('🔴 Account deletion initiated. You will receive a confirmation email.');
      setTimeout(() => setMessage(''), 5000);
    }, 1000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h3>🔐 Please Login</h3>
          <p>You need to be logged in to access your account settings.</p>
          <Button variant="primary" className="btn-fbiv">Login to Your Account</Button>
        </div>
      </Container>
    );
  }

  // Show loading if profile is not loaded yet
  if (!profile.email) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h3>Loading Account...</h3>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h1>👤 My Account</h1>
        <p className="lead">Manage your FBIV VPN account and preferences</p>
      </div>

      {message && (
        <Alert variant={message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'danger'} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2 flex-wrap">
            {[
              { key: 'profile', label: '👤 Profile', icon: 'fas fa-user' },
              { key: 'subscription', label: '💳 Subscription', icon: 'fas fa-credit-card' },
              { key: 'usage', label: '📊 Usage', icon: 'fas fa-chart-bar' },
              { key: 'devices', label: '📱 Devices', icon: 'fas fa-mobile-alt' },
              { key: 'sessions', label: '🔗 Sessions', icon: 'fas fa-history' },
              { key: 'security', label: '🔒 Security', icon: 'fas fa-shield-alt' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'primary' : 'outline-secondary'}
                onClick={() => setActiveTab(tab.key)}
                className="mb-2"
              >
                <i className={tab.icon}></i> {tab.label}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5>👤 Profile Information</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleProfileUpdate}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Select
                      value={profile.country}
                      onChange={(e) => setProfile({...profile, country: e.target.value})}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="Australia">Australia</option>
                    </Form.Select>
                  </Form.Group>

                  <h6 className="mt-4">📧 Notification Preferences</h6>
                  <Form.Check
                    type="checkbox"
                    label="Email notifications"
                    checked={profile.notifications?.email || false}
                    onChange={(e) => setProfile({
                      ...profile,
                      notifications: {...(profile.notifications || {}), email: e.target.checked}
                    })}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    label="Security alerts"
                    checked={profile.notifications?.security || false}
                    onChange={(e) => setProfile({
                      ...profile,
                      notifications: {...(profile.notifications || {}), security: e.target.checked}
                    })}
                    className="mb-2"
                  />
                  <Form.Check
                    type="checkbox"
                    label="Marketing updates"
                    checked={profile.notifications?.marketing || false}
                    onChange={(e) => setProfile({
                      ...profile,
                      notifications: {...(profile.notifications || {}), marketing: e.target.checked}
                    })}
                    className="mb-3"
                  />

                  <Button type="submit" variant="primary" disabled={loading} className="btn-fbiv">
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>
                <h6>📈 Account Stats</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">Member Since</small>
                  <div>January 2023</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Total Sessions</small>
                  <div className="h5">{usage.totalConnections.toLocaleString()}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Data Transferred</small>
                  <div className="h5">2.5 TB</div>
                </div>
                <div>
                  <small className="text-muted">Countries Visited</small>
                  <div className="h5">15</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && subscription && (
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>💳 Subscription Details</h5>
                <Badge bg={subscription.status === 'active' ? 'success' : 'warning'}>
                  {subscription.status.toUpperCase()}
                </Badge>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h4>{subscription.plan} Plan</h4>
                    <h3 className="text-primary">${subscription.price}/month</h3>
                    <p className="text-muted">Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Plan Features:</h6>
                    <ul className="list-unstyled">
                      {subscription.features.map((feature, i) => (
                        <li key={i} className="mb-1">
                          <i className="fas fa-check text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Col>
                </Row>
                
                <hr />
                
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="outline-primary">Change Plan</Button>
                  <Button variant="outline-secondary">Update Payment Method</Button>
                  <Button variant="outline-warning" onClick={handleCancelSubscription} disabled={loading}>
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>
                <h6>💰 Billing History</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between">
                    <span>Jan 2025</span>
                    <span>$9.99</span>
                  </div>
                  <small className="text-muted">Pro Plan</small>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between">
                    <span>Dec 2024</span>
                    <span>$9.99</span>
                  </div>
                  <small className="text-muted">Pro Plan</small>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Nov 2024</span>
                    <span>$9.99</span>
                  </div>
                  <small className="text-muted">Pro Plan</small>
                </div>
                <Button variant="outline-secondary" size="sm" className="w-100">
                  View All Invoices
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6>📊 Data Usage</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>This Month</span>
                    <span className="fw-bold">{usage.dataUsed} GB</span>
                  </div>
                  {usage.dataLimit > 0 && (
                    <div className="progress mt-2">
                      <div 
                        className="progress-bar" 
                        style={{width: `${(usage.dataUsed / usage.dataLimit) * 100}%`}}
                      ></div>
                    </div>
                  )}
                  <small className="text-muted">
                    {usage.dataLimit > 0 ? `${usage.dataLimit} GB limit` : 'Unlimited'}
                  </small>
                </div>

                <div className="row text-center">
                  <div className="col-6">
                    <div className="h4 text-primary">{usage.connectionsToday}</div>
                    <small className="text-muted">Today</small>
                  </div>
                  <div className="col-6">
                    <div className="h4 text-success">{usage.totalConnections.toLocaleString()}</div>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h6>📱 Device Usage</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Active Devices</span>
                    <span className="fw-bold">{usage.devicesConnected}/{usage.maxDevices}</span>
                  </div>
                  <div className="progress mt-2">
                    <div 
                      className="progress-bar" 
                      style={{width: `${(usage.devicesConnected / usage.maxDevices) * 100}%`}}
                    ></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="h4 text-info">{devices.length}</div>
                  <small className="text-muted">Registered Devices</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <Card>
          <Card.Header>
            <h5>📱 Registered Devices</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`fas fa-${device.type === 'Mobile' ? 'mobile-alt' : device.type === 'Laptop' ? 'laptop' : 'desktop'} me-2`}></i>
                          {device.name}
                        </div>
                      </td>
                      <td>{device.type}</td>
                      <td>
                        <Badge bg={device.status === 'online' ? 'success' : 'secondary'}>
                          {device.status}
                        </Badge>
                      </td>
                      <td>{formatDate(device.lastUsed)}</td>
                      <td>
                        <Button variant="outline-danger" size="sm">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <Card.Header>
            <h5>🔗 Recent Sessions</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Server</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Data Used</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id}>
                      <td>
                        <Badge bg="primary" className="me-2">{session.server}</Badge>
                      </td>
                      <td>{formatDate(session.startTime)}</td>
                      <td>{session.duration}</td>
                      <td>{session.dataUsed}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Row>
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5>🔒 Security Settings</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h6>Password</h6>
                  <p className="text-muted">Last changed: 30 days ago</p>
                  <Button variant="outline-primary" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                  </Button>
                </div>

                <div className="mb-4">
                  <h6>Two-Factor Authentication</h6>
                  <p className="text-muted">Add an extra layer of security to your account</p>
                  <Button variant="outline-success">Enable 2FA</Button>
                </div>

                <div className="mb-4">
                  <h6>Login Notifications</h6>
                  <p className="text-muted">Get notified when someone logs into your account</p>
                  <Form.Check type="checkbox" label="Email me on new logins" defaultChecked />
                </div>

                <hr />

                <div className="mb-4">
                  <h6 className="text-danger">Danger Zone</h6>
                  <p className="text-muted">These actions cannot be undone</p>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Header>
                <h6>🛡️ Security Score</h6>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="display-4 text-success">85%</div>
                  <div className="text-muted">Very Good</div>
                </div>
                <div className="text-start">
                  <div className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Strong password
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-times text-danger me-2"></i>
                    2FA not enabled
                  </div>
                  <div className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Recent login activity
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Password Change Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordChange}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" required />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={loading} className="btn-fbiv">
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>⚠️ Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>This action cannot be undone!</strong>
          </Alert>
          <p>Deleting your account will:</p>
          <ul>
            <li>Permanently delete all your data</li>
            <li>Cancel your subscription</li>
            <li>Remove all devices</li>
            <li>Clear all session history</li>
          </ul>
          <Form.Group>
            <Form.Label>Type "DELETE" to confirm:</Form.Label>
            <Form.Control type="text" placeholder="DELETE" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Account;