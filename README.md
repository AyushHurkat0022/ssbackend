# CoSketch Backend API

[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/wasimrehman05/cosketch-backend)
[![Node.js](https://img.shields.io/badge/Node.js-14+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16.5-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.4-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> Backend API and WebSocket server for CoSketch - a real-time collaborative digital whiteboard. Built with Node.js, Express, MongoDB, and Socket.IO for seamless real-time collaboration.

## ✨ Features

**Real-time Collaboration:**
- WebSocket-based real-time drawing synchronization
- Live user presence and room management
- Instant canvas updates across all connected clients
- User authentication and permission management

**REST API:**
- User registration and authentication (JWT)
- Canvas CRUD operations
- Canvas sharing and permission management
- User profile management

**Security & Performance:**
- JWT-based authentication
- Rate limiting and request validation
- CORS configuration
- Helmet security headers
- Input validation and sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js 14+
- MongoDB (local or cloud instance)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/wasimrehman05/cosketch-backend.git
cd cosketch-backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Start the server
npm start
```

The server will start on http://localhost:3001

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/whiteboard

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Optional: Logging
LOG_LEVEL=info
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/user/register` - User registration
- `POST /api/v1/user/login` - User login
- `GET /api/v1/user/profile` - Get user profile

### Canvas Management
- `GET /api/v1/canvas` - Get user's canvases
- `POST /api/v1/canvas` - Create new canvas
- `GET /api/v1/canvas/:id` - Get canvas by ID
- `PUT /api/v1/canvas/:id` - Update canvas
- `DELETE /api/v1/canvas/:id` - Delete canvas

### Canvas Sharing
- `POST /api/v1/canvas/:id/share` - Share canvas with user
- `DELETE /api/v1/canvas/:id/share/:userId` - Remove canvas share
- `PUT /api/v1/canvas/:id/share/:userId` - Update share permissions

## 🔌 WebSocket Events

### Client to Server
- `join-canvas` - Join a canvas room
- `canvas-update` - Update canvas data
- `element-create` - Create new drawing element
- `element-update` - Update existing element
- `element-delete` - Delete element
- `canvas-name-update` - Update canvas name
- `cursor-update` - Update cursor position

### Server to Client
- `canvas-joined` - Canvas data sent to joining user
- `canvas-updated` - Canvas update broadcast
- `element-created` - New element broadcast
- `element-updated` - Element update broadcast
- `element-deleted` - Element deletion broadcast
- `user-joined` - User joined room notification
- `user-left` - User left room notification
- `room-users` - Current room users list

## 🏗️ Architecture

**Technologies Used:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

**Project Structure:**
```
whiteboard-backend/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── constants/
│   │   └── index.js           # Application constants
│   ├── controllers/
│   │   ├── CanvasController.js # Canvas business logic
│   │   └── UserController.js   # User business logic
│   ├── exceptions/
│   │   ├── index.js           # Exception classes
│   │   ├── InternalServerException.js
│   │   ├── NotFoundException.js
│   │   ├── UnauthorizedException.js
│   │   └── ValidationException.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── rateLimiter.js     # Rate limiting
│   │   ├── requestLogger.js   # Request logging
│   │   └── validateRequest.js # Request validation
│   ├── models/
│   │   ├── CanvasModel.js     # Canvas data model
│   │   └── UserModel.js       # User data model
│   ├── routes/
│   │   ├── CanvasRoute.js     # Canvas API routes
│   │   └── userRoute.js       # User API routes
│   ├── services/
│   │   ├── CanvasService.js   # Canvas business logic
│   │   ├── UserService.js     # User business logic
│   │   └── WebSocketService.js # WebSocket event handling
│   └── utils/
│       ├── logger.js          # Logging utility
│       └── responseHelper.js  # Response formatting
├── public/
│   └── uploads/               # File uploads directory
├── index.js                   # Server entry point
├── package.json               # Dependencies & scripts
├── env.example                # Environment variables template
└── README.md                  # This file
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: User creates account with email/password
2. **Login**: User receives JWT token upon successful login
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **WebSocket**: Token passed in connection auth object

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Canvas Model
```javascript
{
  name: String,
  elements: Array,
  owner: ObjectId (ref: User),
  shared_with: [{
    user: ObjectId (ref: User),
    canEdit: Boolean
  }],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚧 Development

### Running in Development
```bash
npm start  # Uses nodemon for auto-restart
```

### Production Deployment
```bash
NODE_ENV=production npm start
```

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `LOG_LEVEL` - Logging level (info/debug/error)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt for password security
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Request data sanitization
- **CORS Protection** - Cross-origin request control
- **Helmet Headers** - Security headers
- **Error Handling** - Structured error responses

## 📊 API Response Format

All API responses follow a consistent format:

```javascript
{
  "success": boolean,
  "message": "string",
  "data": object,
  "status": number
}
```

## 🐛 Error Handling

The API uses structured error handling with custom exception classes:
- `ValidationException` - Input validation errors
- `UnauthorizedException` - Authentication errors
- `NotFoundException` - Resource not found
- `InternalServerException` - Server errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Wasim Rehman**
- GitHub: [@wasimrehman05](https://github.com/wasimrehman05)

---

⭐ **Star this repository if you found it helpful!** 