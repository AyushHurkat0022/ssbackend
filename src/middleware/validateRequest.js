const { body, param, validationResult } = require('express-validator');
const { ValidationException } = require("../exceptions");
const { VALIDATION_MESSAGES, PASSWORD_MIN_LENGTH } = require("../constants");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach(error => {
            formattedErrors[error.path] = error.msg;
        });
        throw new ValidationException("Validation failed", formattedErrors);
    }
    next();
};

const validateRegistration = [
    body('name')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.USER.NAME_REQUIRED)
        .trim()
        .escape()
        .isLength({ min: 2, max: 50 })
        .withMessage(VALIDATION_MESSAGES.USER.NAME_TOO_SHORT),
    body('email')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.USER.EMAIL_REQUIRED)
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage(VALIDATION_MESSAGES.USER.EMAIL_INVALID_FORMAT),
    body('password')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.USER.PASSWORD_REQUIRED)
        .trim()
        .isLength({ min: PASSWORD_MIN_LENGTH })
        .withMessage(VALIDATION_MESSAGES.USER.PASSWORD_TOO_SHORT),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.USER.EMAIL_REQUIRED)
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage(VALIDATION_MESSAGES.USER.EMAIL_INVALID_FORMAT),
    body('password')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.USER.PASSWORD_REQUIRED)
        .trim(),
    handleValidationErrors
];


const validateShareCanvas = [
    body('email')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.SHARING.EMAIL_REQUIRED)
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage(VALIDATION_MESSAGES.SHARING.EMAIL_INVALID_FORMAT),
    body('canEdit')
        .optional()
        .isBoolean()
        .withMessage(VALIDATION_MESSAGES.SHARING.CAN_EDIT_INVALID),
    handleValidationErrors
];

const validateCanvasId = [
    param('canvasId')
        .notEmpty()
        .withMessage(VALIDATION_MESSAGES.CANVAS.CANVAS_ID_REQUIRED)
        .isMongoId()
        .withMessage(VALIDATION_MESSAGES.CANVAS.CANVAS_ID_INVALID_FORMAT),
    handleValidationErrors
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateShareCanvas,
    validateCanvasId
}; 