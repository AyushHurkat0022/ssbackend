const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        logger.info(`Request completed`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });
        
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = requestLogger; 