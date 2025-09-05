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

const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const webSocketService = new WebSocketService(io);

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

app.use(generalLimiter);

app.use(cors(corsOptions));
app.use(express.json({ limit: REQUEST_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMIT }));

app.use(requestLogger);
console.log("MONGO_URI:", process.env.MONGO_URI);
app.get('/how-are-you-server', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Iam good! How are you?',
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/canvas", canvasRoutes);

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectToDatabase();
        server.listen(PORT, HOST, () => {
            console.log(`Server is running on port ${PORT} and host ${HOST}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`CORS enabled for: ${corsOptions.origin}`);
            console.log(`WebSocket server initialized`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();