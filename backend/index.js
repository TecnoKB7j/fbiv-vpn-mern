// FBIV VPN Backend Server
// Started: October 2025 - Emmanuel Rodriguez (lead), Sarah Chen (consult), Mike Johnson (testing)
// TODO: Clean up this mess when we get time lol
// FIXME: Error handling could be more robust
// NOTE: This works but it's not pretty - prioritizing functionality over perfect code

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // Environment vars - don't commit .env! (learned this the hard way)

const app = express();

// CORS - had to fix this 3 times because of frontend issues
// Sarah kept complaining about CORS errors in development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://fbivvpn.com' : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads later (profile pictures?)

// Rate limiting - added after getting spammed by bots on the old server
// Might be too restrictive but better safe than sorry
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes (maybe too generous?)
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in dev
  message: { 
    error: 'Too many requests, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter); // Only apply to API routes

// Development logging middleware (helps with debugging)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Mock server data - will replace with real VPN servers eventually
// NOTE: These IPs are fake, obviously. Real ones in production DB
const mockServers = [
  // USA servers
  { id: 1, name: 'US-NY-01', location: 'New York, US', country: 'United States', flag: '🇺🇸', ip: '192.168.1.1', load: 23, ping: 12, premium: false },
  { id: 6, name: 'CA-TOR-01', location: 'Toronto, CA', country: 'Canada', flag: '��', ip: '192.168.1.6', load: 15, ping: 14, premium: false },
  
  // European servers  
  { id: 2, name: 'UK-LON-01', location: 'London, UK', country: 'United Kingdom', flag: '��', ip: '192.168.1.2', load: 34, ping: 8, premium: false },
  { id: 4, name: 'DE-FRA-01', location: 'Frankfurt, DE', country: 'Germany', flag: '🇩🇪', ip: '192.168.1.4', load: 45, ping: 18, premium: false },
  { id: 7, name: 'FR-PAR-01', location: 'Paris, FR', country: 'France', flag: '��', ip: '192.168.1.7', load: 38, ping: 16, premium: false },
  { id: 9, name: 'NL-AMS-01', location: 'Amsterdam, NL', country: 'Netherlands', flag: '��', ip: '192.168.1.9', load: 42, ping: 13, premium: false },
  
  // Asia-Pacific (premium servers)
  { id: 3, name: 'JP-TKY-01', location: 'Tokyo, JP', country: 'Japan', flag: '��', ip: '192.168.1.3', load: 12, ping: 15, premium: true }, // Fast server!
  { id: 8, name: 'SG-SIN-01', location: 'Singapore, SG', country: 'Singapore', flag: '🇸🇬', ip: '192.168.1.8', load: 29, ping: 19, premium: true },
  { id: 5, name: 'AU-SYD-01', location: 'Sydney, AU', country: 'Australia', flag: '��', ip: '192.168.1.5', load: 28, ping: 22, premium: true },
  
  // South America
  { id: 10, name: 'BR-SAO-01', location: 'São Paulo, BR', country: 'Brazil', flag: '🇧🇷', ip: '192.168.1.10', load: 31, ping: 25, premium: false }
];

// In-memory user storage (yeah, I know, not ideal but works for now)
// TODO: Move to proper database when Sarah approves the budget
let mockUsers = [];

// === AUTH ENDPOINTS ===
// Registration endpoint - works but needs cleanup
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Registration attempt:', { email, name }); // Debug log
    
    // Basic validation (should probably use Joi or similar)
    if (!name || !email || !password) {
      console.log('Missing required fields'); // Debug
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    // Email format check (regex from Stack Overflow lol)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      console.log('User already exists:', email); // Debug
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (TODO: hash password with bcrypt)
    const newUser = {
      id: Date.now(), // Not the best ID generation but works
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // FIXME: Hash this in production!
      createdAt: new Date().toISOString(),
      subscription: 'free', // Default plan
      lastLogin: null
    };

    mockUsers.push(newUser);
    console.log('New user created:', newUser.id); // Success log

    // Return user data (never send password back!)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: 'mock-jwt-token-' + newUser.id, // Mock token for demo
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Return success without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      subscription: user.subscription
    };

    res.json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-' + user.id, // Mock token for demo
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Get current user info
app.get('/api/auth/me', (req, res) => {
  // In production, verify JWT token here
  res.json({
    id: 1,
    name: 'Demo User',
    email: 'demo@fbivvpn.com',
    subscription: 'pro'
  });
});

// Server Routes
app.get('/api/servers', (req, res) => {
  try {
    // Simulate some randomness in server loads
    const servers = mockServers.map(server => ({
      ...server,
      load: Math.max(5, server.load + Math.floor(Math.random() * 20) - 10),
      ping: Math.max(5, server.ping + Math.floor(Math.random() * 10) - 5)
    }));
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/connect', (req, res) => {
  try {
    const { serverId } = req.body;
    const server = mockServers.find(s => s.id === parseInt(serverId));
    
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    res.json({
      success: true,
      message: `Connected to ${server.location}`,
      server: server
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/disconnect', (req, res) => {
  res.json({
    success: true,
    message: 'Disconnected from VPN'
  });
});

// Speed Test Routes
app.post('/api/speedtest', (req, res) => {
  try {
    const { downloadSpeed, uploadSpeed, ping, jitter, server } = req.body;

    // In a real app, this would be saved to Firebase
    const speedTest = {
      id: Date.now(),
      downloadSpeed,
      uploadSpeed,
      ping,
      jitter,
      server,
      timestamp: new Date().toISOString()
    };

    res.json(speedTest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/speedtest/history', (req, res) => {
  try {
    // Mock speed test history
    const history = [
      { id: 1, downloadSpeed: 856.3, uploadSpeed: 142.7, ping: 12, jitter: 2.1, server: 'New York, US', timestamp: '2025-01-15T10:30:00Z' },
      { id: 2, downloadSpeed: 723.1, uploadSpeed: 98.4, ping: 18, jitter: 3.2, server: 'London, UK', timestamp: '2025-01-14T15:20:00Z' },
      { id: 3, downloadSpeed: 912.5, uploadSpeed: 156.8, ping: 8, jitter: 1.5, server: 'Frankfurt, DE', timestamp: '2025-01-13T09:45:00Z' }
    ];
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Global Stats Route
app.get('/api/stats', (req, res) => {
  const stats = {
    totalUsers: 2847392 + Math.floor(Math.random() * 1000),
    totalServers: 520,
    totalCountries: 60,
    topServers: mockServers.slice(0, 5).map(server => ({
      id: server.id,
      location: server.location,
      flag: server.flag,
      ping: server.ping + Math.floor(Math.random() * 10) - 5,
      load: Math.max(5, server.load + Math.floor(Math.random() * 20) - 10)
    }))
  };
  res.json(stats);
});

// User Routes (Mock data since Firebase handles auth on frontend)
app.get('/api/user/profile', (req, res) => {
  const profile = {
    id: 1,
    username: 'demo_user',
    email: 'demo@fbivvpn.com',
    firstName: 'Demo',
    lastName: 'User',
    phone: '+1-555-0123',
    country: 'United States',
    subscription: 'Pro',
    joinDate: '2023-01-15',
    notifications: {
      email: true,
      security: true,
      marketing: false
    }
  };
  res.json(profile);
});

app.get('/api/user/usage', (req, res) => {
  const usage = {
    dataUsed: 125.5 + Math.random() * 50,
    dataLimit: -1,
    connectionsToday: 12 + Math.floor(Math.random() * 10),
    totalConnections: 1547 + Math.floor(Math.random() * 100),
    devicesConnected: 3,
    maxDevices: 5
  };
  res.json(usage);
});

app.get('/api/user/subscription', (req, res) => {
  const subscription = {
    plan: 'Pro',
    status: 'active',
    nextBilling: '2025-02-15',
    price: 9.99,
    features: ['5 Devices', 'Unlimited Data', '30 Countries', 'Premium Support']
  };
  res.json(subscription);
});

app.get('/api/user/devices', (req, res) => {
  const devices = [
    { id: 1, name: 'Windows PC', type: 'Desktop', lastUsed: '2025-01-15T10:30:00Z', status: 'online' },
    { id: 2, name: 'iPhone 13', type: 'Mobile', lastUsed: '2025-01-15T09:15:00Z', status: 'offline' },
    { id: 3, name: 'MacBook Pro', type: 'Laptop', lastUsed: '2025-01-14T18:45:00Z', status: 'offline' }
  ];
  res.json(devices);
});

app.get('/api/user/sessions', (req, res) => {
  const sessions = [
    { id: 1, server: 'US-NY-01', startTime: '2025-01-15T10:30:00Z', duration: '2h 15m', dataUsed: '1.2 GB' },
    { id: 2, server: 'UK-LON-03', startTime: '2025-01-14T18:45:00Z', duration: '45m', dataUsed: '450 MB' },
    { id: 3, server: 'JP-TKY-02', startTime: '2025-01-14T14:20:00Z', duration: '1h 30m', dataUsed: '800 MB' }
  ];
  res.json(sessions);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FBIV VPN API is running',
    timestamp: new Date().toISOString(),
    database: 'Firebase (Frontend)',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 FBIV VPN Server running on port', PORT);
  console.log('📡 API endpoints available at http://localhost:' + PORT + '/api');
  console.log('💚 Health check: http://localhost:' + PORT + '/api/health');
  console.log('🔥 Using Firebase for authentication (frontend)');
  console.log('📊 Mock data endpoints ready');
  console.log('✅ Server started successfully!');
});