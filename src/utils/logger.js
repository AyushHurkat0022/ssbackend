const logger = {
    info: (message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message,
            data,
            environment: process.env.NODE_ENV || 'development'
        };
        console.log(JSON.stringify(logEntry));
    },
    
    error: (message, error = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            error: {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            environment: process.env.NODE_ENV || 'development'
        };
        console.error(JSON.stringify(logEntry));
    },
    
    warn: (message, data = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message,
            data,
            environment: process.env.NODE_ENV || 'development'
        };
        console.warn(JSON.stringify(logEntry));
    },
    
    debug: (message, data = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: 'DEBUG',
                message,
                data,
                environment: 'development'
            };
            console.log(JSON.stringify(logEntry));
        }
    }
};

module.exports = logger; 