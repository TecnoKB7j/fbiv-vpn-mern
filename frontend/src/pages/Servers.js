import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { useVPN } from '../contexts/VPNContext';
import { useAuth } from '../contexts/AuthContext';

const Servers = () => {
  const { 
    servers, 
    loadServers, 
    isLoadingServers, 
    connectToServer, 
    disconnect,
    connectedServer,
    connectionStatus,
    toggleFavoriteServer 
  } = useVPN();
  
  const { isLoggedIn } = useAuth();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [speedFilter, setSpeedFilter] = useState('');
  const [loadFilter, setLoadFilter] = useState('');
  const [featureFilter, setFeatureFilter] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Server comparison
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonServers, setComparisonServers] = useState([]);
  
  // Server details modal
  const [selectedServer, setSelectedServer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadServerData();
  }, []);

  const loadServerData = () => {
    const filters = {
      search: searchTerm,
      region: regionFilter,
      speedFilter,
      loadFilter,
      featureFilter
    };
    loadServers(filters);
  };

  useEffect(() => {
    loadServerData();
  }, [searchTerm, regionFilter, speedFilter, loadFilter, featureFilter]);

  const handleConnect = async (server) => {
    if (connectedServer?._id === server._id) {
      await disconnect();
    } else {
      const result = await connectToServer(server);
      if (result.success) {
        // Success handled in context
      } else {
        alert(`Connection failed: ${result.message}`);
      }
    }
  };

  const handleFavorite = async (server) => {
    if (!isLoggedIn) {
      alert('Please login to save favorites');
      return;
    }
    await toggleFavoriteServer(server._id);
  };

  const addToComparison = (server) => {
    if (comparisonServers.length >= 3) {
      alert('You can compare up to 3 servers at a time');
      return;
    }
    if (!comparisonServers.find(s => s._id === server._id)) {
      setComparisonServers([...comparisonServers, server]);
    }
  };

  const removeFromComparison = (serverId) => {
    setComparisonServers(comparisonServers.filter(s => s._id !== serverId));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRegionFilter('');
    setSpeedFilter('');
    setLoadFilter('');
    setFeatureFilter('');
    setShowFavorites(false);
  };

  const filteredServers = servers.filter(server => {
    if (showFavorites && !server.isFavorite) return false;
    return true;
  });

  const getPingClass = (ping) => {
    if (ping < 20) return 'text-success';
    if (ping < 50) return 'text-warning';
    return 'text-danger';
  };

  const getLoadClass = (load) => {
    if (load < 40) return 'bg-success';
    if (load < 70) return 'bg-warning';
    return 'bg-danger';
  };

  const getLoadColor = (load) => {
    if (load < 40) return 'success';
    if (load < 70) return 'warning';
    return 'danger';
  };

  const getServerStatus = (server) => {
    if (server.uptime >= 99.5) return { text: 'Online', class: 'success' };
    if (server.uptime >= 98) return { text: 'Warning', class: 'warning' };
    return { text: 'Offline', class: 'danger' };
  };

  const ServerCard = ({ server }) => (
    <Card className={`server-card h-100 ${connectedServer?._id === server._id ? 'server-connected' : ''} ${server.isFavorite ? 'server-premium' : ''}`}>
      <Card.Header className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="server-title d-flex align-items-center">
            <span className="flag-icon me-2">{server.flag}</span>
            {server.location}
            {server.isFavorite && <Badge bg="warning" className="ms-2">⭐</Badge>}
          </h5>
          <p className="server-subtitle text-muted mb-0">
            {server.cities} cities • {server.region}
          </p>
        </div>
        <Badge bg={getServerStatus(server).class} className="status-dot">
          {getServerStatus(server).text}
        </Badge>
      </Card.Header>
      
      <Card.Body>
        {/* Performance Metrics */}
        <Row className="performance-metrics mb-3">
          <Col className="text-center">
            <div className="metric-label">Ping</div>
            <div className={`metric-value ${getPingClass(server.ping)}`}>
              {server.ping}ms
            </div>
          </Col>
          <Col className="text-center">
            <div className="metric-label">Load</div>
            <div className="metric-value">
              <div className="progress" style={{ height: '6px' }}>
                <div 
                  className={`progress-bar ${getLoadClass(server.load)}`}
                  style={{ width: `${server.load}%` }}
                ></div>
              </div>
              <span className="small">{server.load}%</span>
            </div>
          </Col>
          <Col className="text-center">
            <div className="metric-label">Speed</div>
            <div className="metric-value">{server.bandwidth}</div>
          </Col>
        </Row>

        {/* Server Details */}
        <div className="server-details mb-3">
          <div className="detail-row d-flex justify-content-between">
            <span className="detail-label">Provider:</span>
            <span className="detail-value">{server.provider}</span>
          </div>
          <div className="detail-row d-flex justify-content-between">
            <span className="detail-label">Datacenter:</span>
            <span className="detail-value">{server.datacenter}</span>
          </div>
          <div className="detail-row d-flex justify-content-between">
            <span className="detail-label">Uptime:</span>
            <span className="detail-value text-success">{server.uptime}%</span>
          </div>
        </div>

        {/* Features */}
        <div className="server-features mb-3">
          <Badge bg={server.p2p ? 'success' : 'secondary'} className="me-1">
            {server.p2p ? '✅' : '❌'} P2P
          </Badge>
          <Badge bg={server.ipv6 ? 'success' : 'secondary'} className="me-1">
            {server.ipv6 ? '✅' : '❌'} IPv6
          </Badge>
          <Badge bg="info">🔒 AES-256</Badge>
        </div>

        {/* User Stats */}
        <div className="user-stats d-flex justify-content-between small text-muted">
          <span>👥 {server.users?.toLocaleString() || 0} users</span>
          <span>📶 {server.maxSpeed} Mbps max</span>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="d-grid gap-2">
          <Button 
            variant={connectedServer?._id === server._id ? 'danger' : 'primary'}
            onClick={() => handleConnect(server)}
            disabled={connectionStatus === 'connecting'}
          >
            {connectedServer?._id === server._id ? '🔓 Disconnect' : '🔗 Connect'}
          </Button>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={() => handleFavorite(server)}
              className="flex-fill"
            >
              {server.isFavorite ? '⭐' : '☆'}
            </Button>
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => {
                setSelectedServer(server);
                setShowDetailsModal(true);
              }}
              className="flex-fill"
            >
              <i className="fas fa-info-circle"></i>
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => addToComparison(server)}
              className="flex-fill"
            >
              <i className="fas fa-balance-scale"></i>
            </Button>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );

  return (
    <Container className="mt-4">
      {/* Server Dashboard Header */}
      <div className="server-dashboard-header mb-4">
        <Row>
          <Col md={8}>
            <h2 className="mb-2">🌍 Global Server Network</h2>
            <p className="text-muted">Connect to our premium servers worldwide for optimal performance and security</p>
          </Col>
          <Col md={4} className="text-end">
            <div className="server-status-indicator">
              <span className="status-dot bg-success"></span>
              <span className="small">All Systems Operational</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Server Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <div className="stat-icon">🌐</div>
              <div className="stat-value">{servers.length}</div>
              <div className="stat-label">Total Servers</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <div className="stat-icon">🌍</div>
              <div className="stat-value">{[...new Set(servers.map(s => s.country))].length}</div>
              <div className="stat-label">Countries</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <div className="stat-icon">⚡</div>
              <div className="stat-value">
                {servers.length > 0 ? 
                  Math.round(servers.reduce((sum, s) => sum + s.maxSpeed, 0) / servers.length) : 0
                } Mbps
              </div>
              <div className="stat-label">Avg Speed</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <Card.Body>
              <div className="stat-icon">👥</div>
              <div className="stat-value">
                {servers.reduce((sum, s) => sum + (s.users || 0), 0).toLocaleString()}
              </div>
              <div className="stat-label">Active Users</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="server-filters mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by city, country, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                <option value="">All Regions</option>
                <option value="Americas">🌎 Americas</option>
                <option value="Europe">🌍 Europe</option>
                <option value="Asia">🌏 Asia-Pacific</option>
                <option value="Africa">🌍 Africa</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={speedFilter} onChange={(e) => setSpeedFilter(e.target.value)}>
                <option value="">All Speeds</option>
                <option value="high">⚡ 1 Gbps+</option>
                <option value="medium">🚀 500 Mbps+</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={loadFilter} onChange={(e) => setLoadFilter(e.target.value)}>
                <option value="">All Loads</option>
                <option value="low">🟢 Low (&lt;30%)</option>
                <option value="medium">🟡 Medium (30-60%)</option>
                <option value="high">🟠 High (60%+)</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select value={featureFilter} onChange={(e) => setFeatureFilter(e.target.value)}>
                <option value="">All Features</option>
                <option value="p2p">📡 P2P Optimized</option>
                <option value="ipv6">🌐 IPv6 Support</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <Card className="server-actions mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <Button variant="primary" className="me-2" disabled={isLoadingServers}>
                <i className="fas fa-bolt"></i> Auto-Connect Best Server
              </Button>
              <Button variant="outline-success" className="me-2" onClick={loadServerData}>
                <i className="fas fa-sync-alt"></i> Refresh Servers
              </Button>
              <Button 
                variant="outline-info" 
                className="me-2"
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <i className="fas fa-star"></i> 
                {showFavorites ? ' Show All' : ' Show Favorites'}
              </Button>
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => setShowComparison(!showComparison)}
              >
                <i className="fas fa-balance-scale"></i> Compare Servers
              </Button>
            </Col>
            <Col md={4} className="text-end">
              <div className="btn-group">
                <Button 
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th"></i> Grid
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i> List
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Server Comparison Panel */}
      {showComparison && (
        <Card className="mb-4">
          <Card.Header>
            <h5><i className="fas fa-balance-scale"></i> Server Comparison</h5>
          </Card.Header>
          <Card.Body>
            {comparisonServers.length > 0 ? (
              <Row>
                {comparisonServers.map(server => (
                  <Col md={4} key={server._id}>
                    <Card className="comparison-card">
                      <Card.Body>
                        <h6>{server.flag} {server.location}</h6>
                        <ul className="list-unstyled small">
                          <li><strong>Ping:</strong> {server.ping}ms</li>
                          <li><strong>Load:</strong> {server.load}%</li>
                          <li><strong>Speed:</strong> {server.bandwidth}</li>
                          <li><strong>Provider:</strong> {server.provider}</li>
                          <li><strong>P2P:</strong> {server.p2p ? '✅' : '❌'}</li>
                          <li><strong>IPv6:</strong> {server.ipv6 ? '✅' : '❌'}</li>
                        </ul>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeFromComparison(server._id)}
                        >
                          Remove
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center text-muted">
                <p>No servers selected for comparison</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Servers Grid */}
      {isLoadingServers ? (
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading servers...</p>
        </div>
      ) : (
        <>
          {filteredServers.length > 0 ? (
            <Row>
              {filteredServers.map(server => (
                <Col lg={4} md={6} key={server._id} className="mb-4">
                  <ServerCard server={server} />
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center py-5">
              <Card.Body>
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>No servers found</h5>
                <p className="text-muted">Try adjusting your search criteria or filters</p>
                <Button variant="outline-primary" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Server Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        {selectedServer && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>
                {selectedServer.flag} {selectedServer.location}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <h6>📊 Performance Metrics</h6>
                  <div className="metric-item">
                    <strong>Latency:</strong> <span className={getPingClass(selectedServer.ping)}>{selectedServer.ping}ms</span>
                  </div>
                  <div className="metric-item">
                    <strong>Load:</strong> 
                    <Badge bg={getLoadColor(selectedServer.load)} className="ms-2">
                      {selectedServer.load}%
                    </Badge>
                  </div>
                  <div className="metric-item">
                    <strong>Bandwidth:</strong> {selectedServer.bandwidth}
                  </div>
                  <div className="metric-item">
                    <strong>Uptime:</strong> <span className="text-success">{selectedServer.uptime}%</span>
                  </div>
                </Col>
                <Col md={6}>
                  <h6>🌐 Server Information</h6>
                  <div className="metric-item">
                    <strong>Region:</strong> {selectedServer.region}
                  </div>
                  <div className="metric-item">
                    <strong>Provider:</strong> {selectedServer.provider}
                  </div>
                  <div className="metric-item">
                    <strong>Datacenter:</strong> {selectedServer.datacenter}
                  </div>
                  <div className="metric-item">
                    <strong>Timezone:</strong> {selectedServer.timezone}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant={connectedServer?._id === selectedServer._id ? 'danger' : 'primary'}
                onClick={() => {
                  handleConnect(selectedServer);
                  setShowDetailsModal(false);
                }}
              >
                {connectedServer?._id === selectedServer._id ? '🔓 Disconnect' : '🔒 Connect'}
              </Button>
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Servers;