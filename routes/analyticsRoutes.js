// import required modules
const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// all analytics routes require authentication
router.use(verifyToken);

// --- VALIDATION ---
const analyticsQueryValidation = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('start_date must be a valid ISO 8601 date format'),
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('end_date must be a valid ISO 8601 date format'),
    query('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('period must be one of: day, week, month, year')
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
router.get('/tasks-by-status', analyticsQueryValidation, handleValidationErrors, analyticsController.getTasksByStatus);
router.get('/tasks-by-priority', analyticsQueryValidation, handleValidationErrors, analyticsController.getTasksByPriority);
router.get('/completion-rate', analyticsQueryValidation, handleValidationErrors, analyticsController.getCompletionRate);
router.get('/dashboard-summary', handleValidationErrors, analyticsController.getDashboardSummary);

// export analyticsRoutes
module.exports = router;

