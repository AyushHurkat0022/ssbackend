const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '1d';
const PASSWORD_MIN_LENGTH = 6;

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const REQUEST_SIZE_LIMIT = '10mb';

// WebSocket Configuration
const WEBSOCKET = {
    // Connection settings
    RECONNECTION_ATTEMPTS: 5,
    RECONNECTION_DELAY: 1000,
    CONNECTION_TIMEOUT: 20000,
    
    // Event names
    EVENTS: {
        // Connection events
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        CONNECT_ERROR: 'connect_error',
        ERROR: 'error',
        CONNECTION_STATUS: 'connection-status',
        
        // Canvas events
        JOIN_CANVAS: 'join-canvas',
        CANVAS_JOINED: 'canvas-joined',
        CANVAS_UPDATE: 'canvas-update',
        CANVAS_UPDATED: 'canvas-updated',
        CANVAS_NAME_UPDATE: 'canvas-name-update',
        CANVAS_NAME_UPDATED: 'canvas-name-updated',
        
        // Element events
        ELEMENT_CREATE: 'element-create',
        ELEMENT_CREATED: 'element-created',
        ELEMENT_UPDATE: 'element-update',
        ELEMENT_UPDATED: 'element-updated',
        ELEMENT_DELETE: 'element-delete',
        ELEMENT_DELETED: 'element-deleted',
        
        // User events
        USER_JOINED: 'user-joined',
        USER_LEFT: 'user-left',
        ROOM_USERS: 'room-users',
        
        // Cursor events
        CURSOR_UPDATE: 'cursor-update',
        CURSOR_UPDATED: 'cursor-updated'
    },
    
    // Room prefixes
    ROOM_PREFIX: 'canvas-',
    
    // Error messages
    ERRORS: {
        TOKEN_REQUIRED: 'Authentication error: Token required',
        TOKEN_INVALID: 'Authentication error: Invalid token',
        TOKEN_STRUCTURE: 'Authentication error: Invalid token structure',
        USER_NOT_FOUND: 'Authentication error: User not found',
        CANVAS_ID_REQUIRED: 'Canvas ID is required',
        ACCESS_DENIED: 'Access denied to this canvas',
        NOT_IN_ROOM: 'Not in canvas room',
        CANVAS_NOT_FOUND: 'Canvas not found or no access',
        NO_EDIT_PERMISSION: 'No edit permission for this canvas',
        JOIN_FAILED: 'Failed to join canvas',
        UPDATE_FAILED: 'Failed to update canvas',
        ELEMENT_CREATE_FAILED: 'Error creating element',
        ELEMENT_UPDATE_FAILED: 'Error updating element',
        ELEMENT_DELETE_FAILED: 'Error deleting element',
        NAME_UPDATE_FAILED: 'Error updating canvas name'
    }
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Comprehensive error messages organized by category
const ERROR_MESSAGES = {
    // Authentication & Authorization
    AUTHENTICATION: {
        TOKEN_REQUIRED: 'Authentication token is required',
        TOKEN_INVALID: 'Invalid authentication token',
        TOKEN_EXPIRED: 'Authentication token has expired',
        TOKEN_MALFORMED: 'Malformed authentication token',
        INVALID_CREDENTIALS: 'Invalid email or password',
        ACCOUNT_LOCKED: 'Account is temporarily locked',
        SESSION_EXPIRED: 'User session has expired',
        INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
        ACCESS_DENIED: 'Access denied for this resource'
    },

    // User Management
    USER: {
        NOT_FOUND: 'User account not found',
        ALREADY_EXISTS: 'User account already exists',
        REGISTRATION_FAILED: 'User registration failed',
        PROFILE_UPDATE_FAILED: 'Profile update failed',
        ACCOUNT_DELETED: 'User account has been deleted',
        EMAIL_NOT_VERIFIED: 'Email address not verified',
        PASSWORD_RESET_REQUIRED: 'Password reset required'
    },

    // Canvas Management
    CANVAS: {
        NOT_FOUND: 'Canvas not found',
        ALREADY_EXISTS: 'Canvas with this name already exists',
        CREATION_FAILED: 'Canvas creation failed',
        UPDATE_FAILED: 'Canvas update failed',
        DELETION_FAILED: 'Canvas deletion failed',
        ACCESS_DENIED: 'Access denied to this canvas',
        SHARING_FAILED: 'Canvas sharing failed',
        UNSHARING_FAILED: 'Canvas unsharing failed',
        ELEMENT_UPDATE_FAILED: 'Canvas elements update failed',
        SETTINGS_UPDATE_FAILED: 'Canvas settings update failed'
    },

    // Validation
    VALIDATION: {
        FAILED: 'Validation failed',
        INVALID_INPUT: 'Invalid input provided',
        MISSING_REQUIRED_FIELDS: 'Required fields are missing',
        INVALID_FORMAT: 'Invalid data format',
        DUPLICATE_ENTRY: 'Duplicate entry found',
        CONSTRAINT_VIOLATION: 'Data constraint violation'
    },

    // Database
    DATABASE: {
        CONNECTION_FAILED: 'Database connection failed',
        QUERY_FAILED: 'Database query failed',
        TRANSACTION_FAILED: 'Database transaction failed',
        CONSTRAINT_ERROR: 'Database constraint error',
        DUPLICATE_KEY: 'Duplicate key error'
    },

    // File Operations
    FILE: {
        UPLOAD_FAILED: 'File upload failed',
        DOWNLOAD_FAILED: 'File download failed',
        NOT_FOUND: 'File not found',
        TOO_LARGE: 'File size exceeds limit',
        INVALID_TYPE: 'Invalid file type',
        PROCESSING_FAILED: 'File processing failed'
    },

    // Rate Limiting
    RATE_LIMIT: {
        TOO_MANY_REQUESTS: 'Too many requests, please try again later',
        RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
        SLOW_DOWN: 'Please slow down your requests'
    },

    // General
    GENERAL: {
        INTERNAL_ERROR: 'Internal server error',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        BAD_REQUEST: 'Bad request',
        NOT_FOUND: 'Resource not found',
        METHOD_NOT_ALLOWED: 'Method not allowed',
        REQUEST_TIMEOUT: 'Request timeout',
        PAYLOAD_TOO_LARGE: 'Request payload too large'
    }
};

// Comprehensive validation messages with consistent naming
const VALIDATION_MESSAGES = {
    // User Validation
    USER: {
        NAME_REQUIRED: 'Name is required',
        NAME_TOO_SHORT: `Name must be at least 2 characters long`,
        NAME_TOO_LONG: 'Name must be 50 characters or less',
        NAME_INVALID_FORMAT: 'Name contains invalid characters',
        
        EMAIL_REQUIRED: 'Email address is required',
        EMAIL_INVALID_FORMAT: 'Please provide a valid email address',
        EMAIL_TOO_LONG: 'Email address is too long',
        EMAIL_ALREADY_EXISTS: 'Email address is already registered',
        EMAIL_NOT_FOUND: 'Email address not found',
        EMAIL_NOT_VERIFIED: 'Email address not verified',
        
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
        PASSWORD_TOO_LONG: 'Password must be 128 characters or less',
        PASSWORD_INCORRECT: 'Incorrect password',
        PASSWORD_WEAK: 'Password is too weak. Include uppercase, lowercase, numbers, and special characters',
        PASSWORD_MISMATCH: 'Passwords do not match',
        PASSWORD_SAME_AS_OLD: 'New password must be different from the current password'
    },

    // Canvas Validation
    CANVAS: {
        NAME_REQUIRED: 'Canvas name is required',
        NAME_TOO_SHORT: 'Canvas name must be at least 1 character long',
        NAME_TOO_LONG: 'Canvas name must be 100 characters or less',
        NAME_INVALID_FORMAT: 'Canvas name contains invalid characters',
        NAME_ALREADY_EXISTS: 'Canvas with this name already exists',
        
        DESCRIPTION_TOO_LONG: 'Description must be 500 characters or less',
        DESCRIPTION_INVALID_FORMAT: 'Description contains invalid characters',
        
        ELEMENTS_REQUIRED: 'Canvas elements are required',
        ELEMENTS_INVALID_FORMAT: 'Canvas elements must be an array',
        ELEMENTS_TOO_MANY: 'Canvas contains too many elements',
        
        SETTINGS_INVALID_FORMAT: 'Canvas settings must be an object',
        SETTINGS_INVALID_BACKGROUND: 'Invalid background color format',
        SETTINGS_INVALID_GRID_SIZE: 'Grid size must be between 5 and 100',
        
        IS_PUBLIC_INVALID: 'Public status must be a boolean value',
        
        CANVAS_ID_REQUIRED: 'Canvas ID is required',
        CANVAS_ID_INVALID_FORMAT: 'Invalid canvas ID format',
        CANVAS_ID_NOT_FOUND: 'Canvas ID not found'
    },

    // Sharing Validation
    SHARING: {
        EMAIL_REQUIRED: 'Email address is required for sharing',
        EMAIL_INVALID_FORMAT: 'Please provide a valid email address for sharing',
        EMAIL_NOT_FOUND: 'User with this email address not found',
        EMAIL_SELF_SHARE: 'Cannot share canvas with yourself',
        EMAIL_ALREADY_SHARED: 'Canvas is already shared with this user',
        
        CAN_EDIT_INVALID: 'Edit permission must be a boolean value',
        
        TARGET_USER_ID_REQUIRED: 'Target user ID is required',
        TARGET_USER_ID_INVALID_FORMAT: 'Invalid target user ID format',
        TARGET_USER_ID_NOT_FOUND: 'Target user not found',
        TARGET_USER_ID_NOT_SHARED: 'Canvas is not shared with this user'
    },

    // General Validation
    GENERAL: {
        REQUIRED_FIELD: 'This field is required',
        INVALID_FORMAT: 'Invalid format',
        TOO_SHORT: 'Value is too short',
        TOO_LONG: 'Value is too long',
        INVALID_TYPE: 'Invalid data type',
        INVALID_VALUE: 'Invalid value provided',
        DUPLICATE_VALUE: 'Value already exists',
        OUT_OF_RANGE: 'Value is out of acceptable range',
        INVALID_CHARACTERS: 'Contains invalid characters',
        FUTURE_DATE_NOT_ALLOWED: 'Future dates are not allowed',
        PAST_DATE_NOT_ALLOWED: 'Past dates are not allowed'
    },

    // Query Parameters
    QUERY: {
        PAGE_INVALID: 'Page number must be a positive integer',
        LIMIT_INVALID: 'Limit must be a positive integer between 1 and 100',
        SORT_INVALID: 'Invalid sort parameter',
        FILTER_INVALID: 'Invalid filter parameter',
        SEARCH_INVALID: 'Invalid search parameter'
    },

    // File Validation
    FILE: {
        SIZE_TOO_LARGE: 'File size exceeds maximum limit',
        TYPE_NOT_ALLOWED: 'File type not allowed',
        NAME_TOO_LONG: 'File name is too long',
        NAME_INVALID_CHARACTERS: 'File name contains invalid characters',
        UPLOAD_FAILED: 'File upload failed',
        PROCESSING_FAILED: 'File processing failed'
    }
};

// HTTP Status Code Messages
const HTTP_STATUS_MESSAGES = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
};

// Success Messages
const SUCCESS_MESSAGES = {
    USER: {
        REGISTERED: 'User registered successfully',
        LOGGED_IN: 'User logged in successfully',
        PROFILE_UPDATED: 'Profile updated successfully',
        PASSWORD_CHANGED: 'Password changed successfully',
        ACCOUNT_DELETED: 'Account deleted successfully'
    },
    CANVAS: {
        CREATED: 'Canvas created successfully',
        UPDATED: 'Canvas updated successfully',
        DELETED: 'Canvas deleted successfully',
        SHARED: 'Canvas shared successfully',
        UNSHARED: 'Canvas unshared successfully',
        PERMISSION_UPDATED: 'Canvas permission updated successfully',
        FETCHED: 'Canvas fetched successfully',
        LIST_FETCHED: 'Canvases fetched successfully'
    },
    GENERAL: {
        OPERATION_SUCCESSFUL: 'Operation completed successfully',
        DATA_FETCHED: 'Data fetched successfully',
        SETTINGS_UPDATED: 'Settings updated successfully'
    }
};

module.exports = {
    SALT_ROUNDS,
    JWT_EXPIRES_IN,
    PASSWORD_MIN_LENGTH,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS,
    REQUEST_SIZE_LIMIT,
    WEBSOCKET,
    HTTP_STATUS,
    HTTP_STATUS_MESSAGES,
    ERROR_MESSAGES,
    VALIDATION_MESSAGES,
    SUCCESS_MESSAGES
}; 