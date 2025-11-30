// import required modules
const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// all user routes require authentication
router.use(verifyToken);

// --- VALIDATION ---
const userIdValidation = [
    param('id')
        .isInt()
        .withMessage('User ID must be an integer')
];

const userQueryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Search term must be less than 255 characters')
];

// --- VALIDATION ERROR HANDLER ---
const { validationResult } = require('express-validator');
function handleValidationErrors( req, res, next )
{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
}

// --- ROUTES ---
router.get('/', userQueryValidation, handleValidationErrors, userController.getAllUsers);
router.get('/:id', userIdValidation, handleValidationErrors, userController.getUserById);

// export userRoutes
module.exports = router;

