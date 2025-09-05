class ValidationException extends Error {
    constructor(message = "Validation failed", errors = {}, statusCode = 400) {
        super(message);
        this.name = "ValidationException";
        this.errors = errors;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ValidationException;
