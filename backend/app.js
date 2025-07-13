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

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

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
}).then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1); // Exit process if database connection fails
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use(errorHandler);

// Start server with WebSocket support
const http = require('http');
const WebSocketManager = require('./middleware/websocket');
const activityWebSocket = require('./services/activityWebSocket');

const PORT = process.env.PORT || 5001;
const WS_PORT = process.env.WS_PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket services
WebSocketManager.initialize(server);
activityWebSocket.initialize(server);

// Start the main server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start WebSocket server on separate port if specified
if (WS_PORT !== PORT) {
  const wsServer = http.createServer();
  WebSocketManager.initialize(wsServer);
  wsServer.listen(WS_PORT, () => {
    console.log(`WebSocket server running on port ${WS_PORT}`);
  });
}

// Export the app
module.exports = app;
