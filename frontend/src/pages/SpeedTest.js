import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import { useVPN } from '../contexts/VPNContext';

const SpeedTest = () => {
  const { 
    speedTestResults, 
    speedTestHistory, 
    isTesting, 
    runSpeedTest,
    connectedServer,
    connectionStatus 
  } = useVPN();

  // Test configuration
  const [testDuration, setTestDuration] = useState(30);
  const [testType, setTestType] = useState('comprehensive');
  const [autoSaveResults, setAutoSaveResults] = useState(true);

  // Current test state
  const [currentPhase, setCurrentPhase] = useState('');
  const [testProgress, setTestProgress] = useState(0);
  const [currentSpeeds, setCurrentSpeeds] = useState({
    download: 0,
    upload: 0,
    ping: 0,
    jitter: 0
  });

  // Diagnostic results
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const handleSpeedTest = async () => {
    setCurrentPhase('Initializing...');
    setTestProgress(0);
    setCurrentSpeeds({ download: 0, upload: 0, ping: 0, jitter: 0 });

    // Simulate test phases with progress updates
    const phases = [
      { name: 'Testing Ping...', duration: 2000, field: 'ping' },
      { name: 'Testing Download Speed...', duration: testDuration * 500, field: 'download' },
      { name: 'Testing Upload Speed...', duration: testDuration * 400, field: 'upload' },
      { name: 'Testing Jitter...', duration: 1500, field: 'jitter' },
      { name: 'Analyzing Results...', duration: 1000, field: null }
    ];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      setCurrentPhase(phase.name);
      
      const phaseProgress = (i / phases.length) * 100;
      setTestProgress(phaseProgress);

      // Simulate progressive speed updates
      if (phase.field) {
        const steps = 20;
        const stepDuration = phase.duration / steps;
        
        for (let step = 0; step < steps; step++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          
          const progress = (step + 1) / steps;
          const stepProgress = phaseProgress + (progress * (100 / phases.length));
          setTestProgress(stepProgress);

          // Update speeds based on phase
          if (phase.field === 'ping') {
            setCurrentSpeeds(prev => ({
              ...prev,
              ping: 5 + Math.random() * 15 + (1 - progress) * 10
            }));
          } else if (phase.field === 'download') {
            setCurrentSpeeds(prev => ({
              ...prev,
              download: Math.random() * 950 * progress + Math.random() * 50
            }));
          } else if (phase.field === 'upload') {
            setCurrentSpeeds(prev => ({
              ...prev,
              upload: Math.random() * 150 * progress + Math.random() * 20
            }));
          } else if (phase.field === 'jitter') {
            setCurrentSpeeds(prev => ({
              ...prev,
              jitter: Math.random() * 20 * (1 - progress) + Math.random() * 5
            }));
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, phase.duration));
        setTestProgress(100);
      }
    }

    // Run the actual speed test
    await runSpeedTest({ duration: testDuration, type: testType, autoSave: autoSaveResults });
    setCurrentPhase('');
    setTestProgress(0);
  };

  const runNetworkDiagnostic = async () => {
    setIsDiagnosticRunning(true);
    
    // Simulate diagnostic
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setDiagnosticResults({
      dns: (Math.random() * 50 + 10).toFixed(0),
      packetLoss: (Math.random() * 2).toFixed(1),
      hops: Math.floor(Math.random() * 5 + 8),
      mtu: 1500,
      jitter: (Math.random() * 10 + 1).toFixed(1)
    });
    
    setIsDiagnosticRunning(false);
  };

  const getQualityScore = (results) => {
    if (!results) return 0;
    const download = parseFloat(results.download) || 0;
    const upload = parseFloat(results.upload) || 0;
    const ping = parseFloat(results.ping) || 100;
    const jitter = parseFloat(results.jitter) || 50;
    
    const downloadScore = Math.min((download / 100) * 40, 40);
    const uploadScore = Math.min((upload / 50) * 30, 30);
    const pingScore = Math.max(20 - (ping / 5), 0);
    const jitterScore = Math.max(10 - (jitter / 5), 0);
    
    return Math.round(downloadScore + uploadScore + pingScore + jitterScore);
  };

  const getQualityText = (score) => {
    if (score >= 90) return { text: 'Excellent', class: 'success' };
    if (score >= 70) return { text: 'Good', class: 'info' };
    if (score >= 50) return { text: 'Fair', class: 'warning' };
    return { text: 'Poor', class: 'danger' };
  };

  const getGamingRating = (results) => {
    if (!results) return 'Unknown';
    const ping = parseFloat(results.ping) || 100;
    const jitter = parseFloat(results.jitter) || 50;
    
    if (ping <= 20 && jitter <= 5) return 'Excellent for gaming';
    if (ping <= 50 && jitter <= 15) return 'Good for gaming';
    if (ping <= 100 && jitter <= 30) return 'Fair for gaming';
    return 'Poor for gaming';
  };

  const getStreamingRating = (results) => {
    if (!results) return 'Unknown';
    const download = parseFloat(results.download) || 0;
    
    if (download >= 25) return 'Perfect for 4K';
    if (download >= 15) return 'Good for 4K';
    if (download >= 5) return 'Good for HD';
    return 'Limited streaming';
  };

  const exportHistory = () => {
    const csv = 'Time,Download,Upload,Ping,Jitter\n' + 
      speedTestHistory.map(test => 
        `${test.timestamp},${test.download},${test.upload},${test.ping},${test.jitter}`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fbiv-speed-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container className="mt-4">
      {/* Speed Test Header */}
      <div className="speed-test-header">
        <Row className="align-items-center">
          <Col md={8}>
            <h2 className="mb-2">⚡ Professional Speed Test</h2>
            <p className="text-muted">Advanced network performance analyzer with real-time metrics and detailed diagnostics</p>
          </Col>
          <Col md={4} className="text-end">
            <div className="connection-indicator">
              <span className={`status-dot ${connectionStatus === 'connected' ? 'status-online' : 'status-offline'}`}></span>
              <span className="small">{connectionStatus === 'connected' ? 'VPN Active' : 'Direct Connection'}</span>
            </div>
          </Col>
        </Row>
      </div>

      {/* Speed Test Dashboard */}
      <Row>
        {/* Main Speed Gauge */}
        <Col lg={6}>
          <Card className="speed-gauge-card h-100">
            <Card.Body className="text-center">
              <h4 className="mb-4">🎯 Current Speed</h4>
              
              <div className="speed-gauge-wrapper mb-4">
                <div className="position-relative d-inline-block">
                  {/* Speed Gauge Visualization */}
                  <div 
                    style={{
                      width: '300px',
                      height: '300px',
                      borderRadius: '50%',
                      background: `conic-gradient(
                        from 0deg,
                        #28a745 0deg ${Math.min((currentSpeeds.download / 1000) * 360, 360)}deg,
                        #e9ecef ${Math.min((currentSpeeds.download / 1000) * 360, 360)}deg 360deg
                      )`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}
                  >
                    <div 
                      style={{
                        width: '250px',
                        height: '250px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--card-bg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div className="speed-value">
                        {isTesting ? currentSpeeds.download.toFixed(1) : (speedTestResults?.download || '0')}
                      </div>
                      <div className="speed-unit">Mbps</div>
                    </div>
                  </div>
                  
                  {isTesting && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                      <div className="pulse-ring"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Test Progress */}
              {isTesting && (
                <div className="mb-3">
                  <div className="mb-2">{currentPhase}</div>
                  <ProgressBar now={testProgress} animated />
                </div>
              )}
              
              {/* Test Controls */}
              <div className="speed-test-controls">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mb-3"
                  onClick={handleSpeedTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {currentPhase || 'Testing...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket"></i> Start Comprehensive Test
                    </>
                  )}
                </Button>
                
                <Row className="g-2">
                  <Col>
                    <Button variant="outline-info" size="sm" disabled={isTesting} className="w-100">
                      📥 Quick Download
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="outline-success" size="sm" disabled={isTesting} className="w-100">
                      📤 Quick Upload
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="outline-warning" size="sm" disabled={isTesting} className="w-100">
                      📡 Ping Test
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Real-time Metrics */}
        <Col lg={6}>
          <Card className="metrics-panel h-100">
            <Card.Header>
              <h5>📊 Real-time Metrics</h5>
            </Card.Header>
            <Card.Body>
              {/* Current Test Results */}
              {(speedTestResults || isTesting) && (
                <div className="current-metrics">
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="metric-item p-3 border rounded">
                        <div className="d-flex align-items-center">
                          <div className="metric-icon me-3">📥</div>
                          <div className="flex-grow-1">
                            <div className="metric-value">
                              {isTesting ? currentSpeeds.download.toFixed(1) : (speedTestResults?.download || '0')} Mbps
                            </div>
                            <div className="metric-label">Download Speed</div>
                            <ProgressBar 
                              now={Math.min(((isTesting ? currentSpeeds.download : parseFloat(speedTestResults?.download || 0)) / 1000) * 100, 100)} 
                              variant="success" 
                              className="mt-1"
                              style={{ height: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="metric-item p-3 border rounded">
                        <div className="d-flex align-items-center">
                          <div className="metric-icon me-3">📤</div>
                          <div className="flex-grow-1">
                            <div className="metric-value">
                              {isTesting ? currentSpeeds.upload.toFixed(1) : (speedTestResults?.upload || '0')} Mbps
                            </div>
                            <div className="metric-label">Upload Speed</div>
                            <ProgressBar 
                              now={Math.min(((isTesting ? currentSpeeds.upload : parseFloat(speedTestResults?.upload || 0)) / 500) * 100, 100)} 
                              variant="info" 
                              className="mt-1"
                              style={{ height: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="metric-item p-3 border rounded">
                        <div className="d-flex align-items-center">
                          <div className="metric-icon me-3">📡</div>
                          <div className="flex-grow-1">
                            <div className="metric-value">
                              {isTesting ? currentSpeeds.ping.toFixed(0) : (speedTestResults?.ping || '0')} ms
                            </div>
                            <div className="metric-label">Latency (Ping)</div>
                            <ProgressBar 
                              now={Math.max(100 - ((isTesting ? currentSpeeds.ping : parseFloat(speedTestResults?.ping || 0)) / 100) * 100, 0)} 
                              variant="warning" 
                              className="mt-1"
                              style={{ height: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="metric-item p-3 border rounded">
                        <div className="d-flex align-items-center">
                          <div className="metric-icon me-3">📈</div>
                          <div className="flex-grow-1">
                            <div className="metric-value">
                              {isTesting ? currentSpeeds.jitter.toFixed(1) : (speedTestResults?.jitter || '0')} ms
                            </div>
                            <div className="metric-label">Jitter</div>
                            <ProgressBar 
                              now={Math.max(100 - ((isTesting ? currentSpeeds.jitter : parseFloat(speedTestResults?.jitter || 0)) / 50) * 100, 0)} 
                              variant="secondary" 
                              className="mt-1"
                              style={{ height: '4px' }}
                            />
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Speed Quality Indicator */}
              {speedTestResults && (
                <div className="speed-quality mt-4 pt-3 border-top">
                  <h6>📶 Connection Quality</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {(() => {
                        const score = getQualityScore(speedTestResults);
                        const quality = getQualityText(score);
                        return (
                          <span className={`badge bg-${quality.class} fs-6`}>
                            {quality.text}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="quality-score">
                      Score: {getQualityScore(speedTestResults)}/100
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Advanced Features */}
      <Row className="mt-4">
        {/* Test History */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5>📈 Test History</h5>
            </Card.Header>
            <Card.Body>
              <div className="history-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {speedTestHistory.slice(0, 10).map((test, index) => (
                  <div key={index} className="history-item p-2 mb-2 border rounded">
                    <div className="d-flex justify-content-between">
                      <div className="history-time small text-muted">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="history-speeds small">
                        <span className="text-success me-2">↓{test.download}</span>
                        <span className="text-info me-2">↑{test.upload}</span>
                        <span className="text-warning">{test.ping}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline-primary" size="sm" className="w-100 mt-2" onClick={exportHistory}>
                📊 Export Full History
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Network Diagnostics */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5>🔧 Network Diagnostics</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={runNetworkDiagnostic}
                  disabled={isDiagnosticRunning}
                >
                  {isDiagnosticRunning ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Running...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-stethoscope"></i> Full Diagnostic
                    </>
                  )}
                </Button>
                <Button variant="outline-warning" size="sm">
                  🌐 DNS Speed Test
                </Button>
                <Button variant="outline-success" size="sm">
                  📦 Packet Loss Test
                </Button>
                <Button variant="outline-danger" size="sm">
                  ⚖️ VPN vs Direct
                </Button>
              </div>
              
              {diagnosticResults && (
                <Alert variant="info" className="mt-3">
                  <strong>Diagnostic Results:</strong>
                  <div className="small mt-2">
                    <div><strong>DNS Resolution:</strong> {diagnosticResults.dns}ms</div>
                    <div><strong>Packet Loss:</strong> {diagnosticResults.packetLoss}%</div>
                    <div><strong>Route Hops:</strong> {diagnosticResults.hops}</div>
                    <div><strong>MTU Size:</strong> {diagnosticResults.mtu}</div>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Insights */}
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h5>📊 Performance Insights</h5>
            </Card.Header>
            <Card.Body>
              {speedTestResults ? (
                <div className="insights">
                  <div className="insight-item p-2 mb-2 border rounded">
                    <div className="d-flex align-items-center">
                      <div className="insight-icon me-2">🎮</div>
                      <div className="insight-text">
                        <strong>Gaming:</strong> {getGamingRating(speedTestResults)}
                      </div>
                    </div>
                  </div>
                  <div className="insight-item p-2 mb-2 border rounded">
                    <div className="d-flex align-items-center">
                      <div className="insight-icon me-2">📺</div>
                      <div className="insight-text">
                        <strong>4K Streaming:</strong> {getStreamingRating(speedTestResults)}
                      </div>
                    </div>
                  </div>
                  <div className="insight-item p-2 mb-2 border rounded">
                    <div className="d-flex align-items-center">
                      <div className="insight-icon me-2">💼</div>
                      <div className="insight-text">
                        <strong>Video Calls:</strong> {
                          speedTestResults.upload >= 3 && speedTestResults.ping <= 50 
                            ? 'Excellent for calls' 
                            : 'May have issues'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="insight-item p-2 mb-2 border rounded">
                    <div className="d-flex align-items-center">
                      <div className="insight-icon me-2">☁️</div>
                      <div className="insight-text">
                        <strong>Cloud Backup:</strong> {
                          speedTestResults.upload >= 10 
                            ? 'Fast backup' 
                            : speedTestResults.upload >= 5 
                            ? 'Good backup' 
                            : 'Slow backup'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>Run a speed test to see performance insights</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Speed Test Settings */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>⚙️ Test Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Test Duration</Form.Label>
                  <Form.Select value={testDuration} onChange={(e) => setTestDuration(Number(e.target.value))}>
                    <option value={10}>Quick (10 seconds)</option>
                    <option value={30}>Standard (30 seconds)</option>
                    <option value={60}>Thorough (60 seconds)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Test Type</Form.Label>
                  <Form.Select value={testType} onChange={(e) => setTestType(e.target.value)}>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="download">Download Only</option>
                    <option value="upload">Upload Only</option>
                    <option value="ping">Ping Only</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Check 
                  type="checkbox"
                  label="Auto-save results to history"
                  checked={autoSaveResults}
                  onChange={(e) => setAutoSaveResults(e.target.checked)}
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>📈 Server Performance</h5>
            </Card.Header>
            <Card.Body>
              {connectedServer ? (
                <Alert variant="success">
                  <strong>Connected to:</strong> {connectedServer.location}<br/>
                  <strong>Expected Speed:</strong> {connectedServer.maxSpeed} Mbps<br/>
                  <strong>Ping:</strong> {connectedServer.ping}ms<br/>
                  <strong>Load:</strong> {connectedServer.load}%
                </Alert>
              ) : (
                <Alert variant="info">
                  Connect to a VPN server to see expected performance metrics.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SpeedTest;