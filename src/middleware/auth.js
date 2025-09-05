const jwt = require('jsonwebtoken');
const { UnauthorizedException } = require('../exceptions');

const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Bearer token is required", { authorization: "Bearer token is required" });
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
        const decoded = jwt.verify(token, jwtSecret);
        
        if (!decoded || !decoded.id || !decoded.email) {
            throw new UnauthorizedException("Invalid token", { authorization: "Invalid token" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token", 
                errors: { authorization: "Invalid token format" } 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expired", 
                errors: { authorization: "Token has expired" } 
            });
        }
        res.status(error.statusCode || 500).json({ 
            message: error.message, 
            errors: error.errors || undefined 
        });
    }
};

module.exports = { authenticateToken }; 