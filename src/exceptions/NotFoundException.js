class NotFoundException extends Error {
    constructor(message = "Resource not found", errors = {}, statusCode = 404) {
        super(message);
        this.name = "NotFoundException";
        this.errors = errors;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = NotFoundException;
