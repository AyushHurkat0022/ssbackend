// index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { connectToDatabase } = require("./src/config/db");
const userRoutes = require("./src/routes/userRoute");
const canvasRoutes = require("./src/routes/CanvasRoute");
const errorHandler = require("./src/middleware/errorHandler");
const requestLogger = require("./src/middleware/requestLogger");
const { REQUEST_SIZE_LIMIT } = require("./src/constants");
const { generalLimiter } = require("./src/middleware/rateLimiter");
const WebSocketService = require("./src/services/WebSocketService");

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

// Allowed origins (frontend URLs)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://ssfrontend-ddc6l6z4i-ayushhurkat0022s-projects.vercel.app'
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Socket.IO with same CORS origins
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

const webSocketService = new WebSocketService(io);

// Helmet for security
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  }));
} else {
  app.use(helmet());
}

// Rate limiter
app.use(generalLimiter);

// Enable CORS
app.use(cors(corsOptions));

// Preflight handler
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));

// Logging
app.use(requestLogger);

// Test endpoint
app.get('/how-are-you-server', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Iam good! How are you?',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/canvas", canvasRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectToDatabase();
    server.listen(PORT, HOST, () => {
      console.log(`Server is running on port ${PORT} and host ${HOST}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`CORS enabled for: ${allowedOrigins}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
