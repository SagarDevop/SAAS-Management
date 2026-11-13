const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const seedInitialData = require('./utils/seedData');
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const walletRoutes = require('./routes/walletRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Connect Database & Auto-Seed
connectDB().then(async () => {
  await seedInitialData();
});

// Robust CORS configuration supporting trailing slashes and multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://frontend-pocx.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(u => u.trim()) : [])
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Strip trailing slashes for clean matching
    const cleanOrigin = origin.replace(/\/+$/, '');
    const cleanAllowed = allowedOrigins.map(o => o.replace(/\/+$/, ''));
    
    if (cleanAllowed.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during deployment testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Support both /api/auth and direct /auth (in case frontend calls /auth/login)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);
app.use(['/api/workers', '/workers'], workerRoutes);
app.use(['/api/attendance', '/attendance'], attendanceRoutes);
app.use(['/api/wallet', '/wallet'], walletRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);
app.use(['/api/notifications', '/notifications'], notificationRoutes);
app.use(['/api/media', '/media'], uploadRoutes);

// Health Check API
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'ShreeDev Paint Service SaaS Backend',
    timestamp: new Date().toISOString()
  });
});

// Webhook Verification & Listener for WhatsApp Cloud API Production Setup
const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'shreedev_paint_webhook_verify_2026';

app.get(['/api/webhook', '/webhook'], (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✓ WhatsApp Webhook verified successfully by Meta!');
    return res.status(200).send(challenge);
  } else {
    return res.status(403).json({ error: 'Verification token mismatch' });
  }
});

app.post(['/api/webhook', '/webhook'], (req, res) => {
  // Acknowledge receipt of delivery status or incoming message immediately
  res.status(200).send('EVENT_RECEIVED');
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ShreeDev Paint Service Backend listening on port ${PORT}`);
  });
}

module.exports = app;
