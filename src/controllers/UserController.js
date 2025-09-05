const jwt = require("jsonwebtoken");
const UserService = require("../services/userService");
const ResponseHelper = require("../utils/responseHelper");
const { JWT_EXPIRES_IN, SUCCESS_MESSAGES } = require("../constants");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        const user = await UserService.register(name, email, password);
        
        return ResponseHelper.created(res, SUCCESS_MESSAGES.USER.REGISTERED, { user });
    } catch (error) {
        return ResponseHelper.error(
            res, 
            error.statusCode || 500, 
            error.message, 
            error.errors || undefined
        );
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const user = await UserService.login(email, password);
        
        const jwtSecret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
        const token = jwt.sign(
            { id: user._id, email: user.email },
            jwtSecret,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.USER.LOGGED_IN, { accessToken: token });
    } catch (error) {
        return ResponseHelper.error(
            res, 
            error.statusCode || 500, 
            error.message, 
            error.errors || undefined
        );
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await UserService.getUserByEmail(req.user.email);
        
        return ResponseHelper.success(res, 200, SUCCESS_MESSAGES.GENERAL.DATA_FETCHED, { user });
    } catch (error) {
        return ResponseHelper.error(
            res, 
            error.statusCode || 500, 
            error.message, 
            error.errors || undefined
        );
    }
};

const checkUserExists = async (req, res) => {
    try {
        const { email } = req.body || {};
        
        if (!email) {
            return ResponseHelper.error(res, 400, "Email is required");
        }

        const user = await UserService.getUserByEmail(email);
        
        if (!user) {
            return ResponseHelper.error(res, 404, "User not found");
        }

        return ResponseHelper.success(res, 200, "User found", { user });
    } catch (error) {
        return ResponseHelper.error(
            res, 
            error.statusCode || 500, 
            error.message, 
            error.errors || undefined
        );
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUserProfile,
    checkUserExists
};