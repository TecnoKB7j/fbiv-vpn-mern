const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MySQL connection using Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './fbiv_vpn.db', // Using SQLite for simplicity
  logging: false
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subscription: {
    type: DataTypes.STRING,
    defaultValue: 'free'
  }
});

// Server Model
const Server = sequelize.define('Server', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  flag: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  },
  load: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ping: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// SpeedTest Model
const SpeedTest = sequelize.define('SpeedTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  downloadSpeed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  uploadSpeed: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ping: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jitter: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  server: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Server Routes
app.get('/api/servers', async (req, res) => {
  try {
    const servers = await Server.findAll();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/connect', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.body;
    const server = await Server.findByPk(serverId);
    
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

app.post('/api/disconnect', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Disconnected from VPN'
  });
});

// Speed Test Routes
app.post('/api/speedtest', authenticateToken, async (req, res) => {
  try {
    const { downloadSpeed, uploadSpeed, ping, jitter, server } = req.body;

    const speedTest = await SpeedTest.create({
      userId: req.user.userId,
      downloadSpeed,
      uploadSpeed,
      ping,
      jitter,
      server
    });

    res.json(speedTest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/speedtest/history', authenticateToken, async (req, res) => {
  try {
    const tests = await SpeedTest.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Global Stats Route
app.get('/api/stats', (req, res) => {
  const stats = {
    totalUsers: 2847392,
    totalServers: 520,
    totalCountries: 60,
    topServers: [
      { id: 1, location: 'New York, US', flag: '🇺🇸', ping: 12, load: 23 },
      { id: 2, location: 'London, UK', flag: '🇬🇧', ping: 8, load: 34 },
      { id: 3, location: 'Tokyo, JP', flag: '🇯🇵', ping: 15, load: 12 },
      { id: 4, location: 'Frankfurt, DE', flag: '🇩🇪', ping: 18, load: 45 },
      { id: 5, location: 'Sydney, AU', flag: '🇦🇺', ping: 22, load: 28 }
    ]
  };
  res.json(stats);
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/user/usage', authenticateToken, (req, res) => {
  const usage = {
    dataUsed: 125.5,
    dataLimit: -1,
    connectionsToday: 12,
    totalConnections: 1547,
    devicesConnected: 3,
    maxDevices: 5
  };
  res.json(usage);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FBIV VPN API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await testConnection();
    await sequelize.sync(); // This creates the tables
    
    // Seed some default servers
    const serverCount = await Server.count();
    if (serverCount === 0) {
      await Server.bulkCreate([
        { name: 'US-NY-01', location: 'New York, US', country: 'United States', flag: '🇺🇸', ip: '192.168.1.1', load: 23, ping: 12 },
        { name: 'UK-LON-01', location: 'London, UK', country: 'United Kingdom', flag: '🇬🇧', ip: '192.168.1.2', load: 34, ping: 8 },
        { name: 'JP-TKY-01', location: 'Tokyo, JP', country: 'Japan', flag: '🇯🇵', ip: '192.168.1.3', load: 12, ping: 15 },
        { name: 'DE-FRA-01', location: 'Frankfurt, DE', country: 'Germany', flag: '🇩🇪', ip: '192.168.1.4', load: 45, ping: 18 },
        { name: 'AU-SYD-01', location: 'Sydney, AU', country: 'Australia', flag: '🇦🇺', ip: '192.168.1.5', load: 28, ping: 22 }
      ]);
      console.log('🌍 Default servers seeded');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 FBIV VPN Server running on port ${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();