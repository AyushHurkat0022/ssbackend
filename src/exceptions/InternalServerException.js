class InternalServerException extends Error {
    constructor(message = "Internal server error", errors = {}, statusCode = 500) {
        super(message);
        this.name = "InternalServerException";
        this.errors = errors;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = InternalServerException;
