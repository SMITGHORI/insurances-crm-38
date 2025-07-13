
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const localStrategy = require('./middleware/passport');
const authMiddleware = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { seedDatabase } = require('./seeders/roleSeeder');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per hour
  message: 'Too many requests from this IP, please try again after an hour'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Passport configuration
app.use(passport.initialize());
passport.use(localStrategy);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const DB_URL = process.env.MONGODB_URI;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Database connected successfully');
  
  // Seed database on first run
  try {
    const roleCount = await mongoose.model('Role').countDocuments();
    if (roleCount === 0) {
      console.log('No roles found, seeding database...');
      await seedDatabase();
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app
module.exports = app;
