class UnauthorizedException extends Error {
    constructor(message = "Unauthorized", errors = {}, statusCode = 401) {
        super(message);
        this.name = "UnauthorizedException";
        this.errors = errors;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = UnauthorizedException;
