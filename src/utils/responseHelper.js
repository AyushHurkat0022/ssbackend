const { HTTP_STATUS } = require("../constants");

class ResponseHelper {
    static success(res, statusCode = HTTP_STATUS.OK, message = "Success", data = {}) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = "Error", errors = {}) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        });
    }

    static created(res, message = "Created successfully", data = {}) {
        return this.success(res, HTTP_STATUS.CREATED, message, data);
    }

    static notFound(res, message = "Resource not found") {
        return this.error(res, HTTP_STATUS.NOT_FOUND, message);
    }

    static unauthorized(res, message = "Unauthorized") {
        return this.error(res, HTTP_STATUS.UNAUTHORIZED, message);
    }

    static badRequest(res, message = "Bad request", errors = {}) {
        return this.error(res, HTTP_STATUS.BAD_REQUEST, message, errors);
    }
}

module.exports = ResponseHelper; 