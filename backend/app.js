const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const activitiesRoutes = require('./routes/activities');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const activityWebSocket = require('./services/activityWebSocket');
const activityLogger = require('./middleware/activityLogger');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insuranceDB';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key';

// CORS Configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Session store
const sessionStore = new MongoStore({
  mongoUrl: MONGODB_URI,
  collectionName: 'sessions'
});

// Express session middleware
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  }
}));

// Passport middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware setup
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(rateLimiter);
app.use(compression());

// Generate request ID
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Activity logging middleware (before routes)
app.use(activityLogger.middleware());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activitiesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is healthy' });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    connections: mongoose.connections.length
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize WebSocket service
const server = require('http').createServer(app);
activityWebSocket.initialize(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
