// import required modules
const { body, query, param, validationResult } = require('express-validator');

// sanitization middleware for common fields
const sanitizeInput = (req, res, next) => {
    // Sanitize string fields in body
    if ( req.body )
    {
        Object.keys(req.body).forEach(key => {
            if ( typeof req.body[key] === 'string' )
            {
                // Trim whitespace
                req.body[key] = req.body[key].trim();
                // Remove null bytes
                req.body[key] = req.body[key].replace(/\0/g, '');
            }
        });
    }

    // Sanitize query parameters
    if ( req.query )
    {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
                req.query[key] = req.query[key].replace(/\0/g, '');
            }
        });
    }

    next();
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() )
    {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Common sanitization rules
const sanitizeString = (field) => {
    return body(field)
        .optional()
        .trim()
        .escape()
        .isLength({ max: 1000 });
};

const sanitizeEmail = () => {
    return body('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please provide a valid email address');
};

const sanitizeInteger = (field) => {
    return body(field)
        .optional()
        .toInt()
        .isInt()
        .withMessage(`${field} must be an integer`);
};

// export sanitization utilities
module.exports = {
    sanitizeInput,
    handleValidationErrors,
    sanitizeString,
    sanitizeEmail,
    sanitizeInteger
};

