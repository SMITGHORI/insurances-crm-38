
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { globalErrorHandler } = require('./utils/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const clientRoutes = require('./routes/clients');
const leadRoutes = require('./routes/leads');
const policyRoutes = require('./routes/policies');
const claimRoutes = require('./routes/claims');
const quotationRoutes = require('./routes/quotations');
const agentRoutes = require('./routes/agents');
const invoiceRoutes = require('./routes/invoices');
const activityRoutes = require('./routes/activities');
const communicationRoutes = require('./routes/communication');
const broadcastRoutes = require('./routes/broadcast');
const enhancedBroadcastRoutes = require('./routes/enhancedBroadcast');
const dashboardRoutes = require('./routes/dashboard');
const headerRoutes = require('./routes/header');
const developerRoutes = require('./routes/developerRoutes');
const roleRoutes = require('./routes/roleRoutes');
const campaignRoutes = require('./routes/campaigns');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance-crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/enhanced-broadcast', enhancedBroadcastRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/header', headerRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/campaigns', campaignRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
