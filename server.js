require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes      = require('./routes/auth');
const studentRoutes   = require('./routes/students');
const markRoutes      = require('./routes/marks');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes    = require('./routes/reports');

// Connect to MongoDB
connectDB();

const app = express();

// ── Security & Utility Middleware ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── API Routes ──
app.use('/api/auth',      authRoutes);
app.use('/api/students',  studentRoutes);
app.use('/api/marks',     markRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports',   reportRoutes);

// ── Serve Frontend (production) ──
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
}

// ── Health Check ──
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'OUTR Acadlytics API is running', timestamp: new Date() })
);

// ── 404 Handler ──
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// ── Global Error Handler ──
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 OUTR Acadlytics Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
