const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticateToken } = require("../middleware/auth");
const { validateRegistration, validateLogin } = require("../middleware/validateRequest");
const { authLimiter } = require("../middleware/rateLimiter");

// Public routes with enhanced security
router.post("/register", authLimiter, validateRegistration, UserController.registerUser);
router.post("/login", authLimiter, validateLogin, UserController.loginUser);
router.post("/check", authLimiter, UserController.checkUserExists);

// Protected routes
router.get("/profile", authenticateToken, UserController.getUserProfile);

module.exports = router;