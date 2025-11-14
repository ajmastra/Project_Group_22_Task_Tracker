// impport required modules
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- VALIDATION RULES FOR REGISTRATION ---
const registerValidation = [

    // email validation
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    // password validation
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    // first name validation
    body('first_name')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('First name must be less than 255 characters'),

    // last name validation
    body('last_name')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Last name must be less than 255 characters')
];

// --- VALIDATION RULES FOR LOGIN ---
const loginValidation = [

    // email validation
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    // password validation
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// --- VALIDATION ERROR HANDLER ---
function handleValidationErrors( req, res, next )
{
    const errors = [];
    // for now, basic validation is done in controller
    next();
}

// --- ROUTES ---
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.get('/profile', verifyToken, authController.getProfile);

// export authRoutes
module.exports = router;

