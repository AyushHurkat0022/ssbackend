const { HTTP_STATUS, ERROR_MESSAGES } = require("../constants");

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || undefined
        });
    }

    if (err.name === 'ValidationError') {
        const errors = {};
        Object.keys(err.errors).forEach(key => {
            errors[key] = err.errors[key].message;
        });
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: ERROR_MESSAGES.VALIDATION_FAILED,
            errors: errors
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Duplicate field value',
            errors: { [field]: `${field} already exists` }
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN,
            errors: { authorization: 'Invalid token format' }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.TOKEN_EXPIRED,
            errors: { authorization: 'Token has expired' }
        });
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        errors: process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
    });
};

module.exports = errorHandler; 