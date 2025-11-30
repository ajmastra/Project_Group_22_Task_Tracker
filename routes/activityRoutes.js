// import required modules
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/authMiddleware');

// all activity routes require authentication
router.use(verifyToken);

// --- VALIDATION ---
const taskIdValidation = [
    param('taskId')
        .isInt()
        .withMessage('Task ID must be an integer')
];

const createActivityValidation = [
    body('task_id')
        .isInt()
        .withMessage('task_id must be an integer'),
    body('action')
        .trim()
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['created', 'updated', 'assigned', 'status_changed', 'completed', 'deleted'])
        .withMessage('Action must be one of: created, updated, assigned, status_changed, completed, deleted'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters')
];

const activityQueryValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('action')
        .optional()
        .isIn(['created', 'updated', 'assigned', 'status_changed', 'completed', 'deleted'])
        .withMessage('Invalid action filter')
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
router.get('/task/:taskId', taskIdValidation, handleValidationErrors, activityController.getTaskActivities);
router.get('/', activityQueryValidation, handleValidationErrors, activityController.getUserActivities);
router.post('/', createActivityValidation, handleValidationErrors, activityController.createActivity);

// export activityRoutes
module.exports = router;

