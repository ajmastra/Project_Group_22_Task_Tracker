// import required modules
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');

// all task routes require authentication
router.use(verifyToken);

// --- VALIDATION FOR TASK CREATION ---
const createTaskValidation = [

    // title validation
    body( 'title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),

    // description validation
    body('description')
        .optional()
        .trim(),

    // status validation
    body('status')
        .optional()
        .isIn(['new', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Status must be one of: new, in_progress, completed, cancelled'),

    // priority validation
    body('priority')
        .optional()
        .custom((value) => {
            // Accept string ('low', 'medium', 'high') or integer (1, 2, 3)
            if ( typeof value === 'string' )
            {
                return ['low', 'medium', 'high'].includes(value);
            }
            if ( typeof value === 'number' )
            {
                return [1, 2, 3].includes(value);
            }
            return false;
        })
        .withMessage('Priority must be one of: low, medium, high (or 1, 2, 3)'),
    
    // due date validation
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date format'),
];

// --- VALIDATION FOR TASK UPDATE ---
const updateTaskValidation = [

    // title validation
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty if provided')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),

    // description validation
    body('description')
        .optional()
        .trim(),

    // status validation
    body('status')
        .optional()
        .isIn(['new', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status value'),

    // priority validation
    body('priority')
        .optional()
        .custom((value) => {
            // accept string ('low', 'medium', 'high') or integer (1, 2, 3)
            if ( typeof value === 'string' )
            {
                return ['low', 'medium', 'high'].includes(value);
            }
            if ( typeof value === 'number' )
            {
                return [1, 2, 3].includes(value);
            }
            return false;
        })
        .withMessage('Priority must be one of: low, medium, high (or 1, 2, 3)'),

    // due date validation
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date format')
];

// --- VALIDATION FOR STATUS UPDATE ---
const updateStatusValidation = [

    // status validation
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['new', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Status must be one of: new, in_progress, completed, cancelled')
];

// --- VALIDATION FOR QUERY FILTERING ---
const taskQueryValidation = [

    // status validation (supports comma-separated values)
    query('status')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const statuses = value.split(',').map(s => s.trim());
                const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
                return statuses.every(s => validStatuses.includes(s));
            }
            return true;
        })
        .withMessage('Invalid status filter'),

    // priority validation (supports comma-separated values)
    query('priority')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const priorities = value.split(',').map(p => p.trim());
                const validPriorities = ['low', 'medium', 'high', '1', '2', '3'];
                return priorities.every(p => validPriorities.includes(p) || !isNaN(parseInt(p)));
            }
            return true;
        })
        .withMessage('Invalid priority filter'),

    // date validation
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('start_date must be a valid ISO 8601 date format'),

    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('end_date must be a valid ISO 8601 date format'),

    query('due_date_start')
        .optional()
        .isISO8601()
        .withMessage('due_date_start must be a valid ISO 8601 date format'),

    query('due_date_end')
        .optional()
        .isISO8601()
        .withMessage('due_date_end must be a valid ISO 8601 date format'),

    // search validation
    query('search')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Search term must be less than 255 characters'),

    // sort validation
    query('sort_by')
        .optional()
        .isIn(['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'])
        .withMessage('sort_by must be one of: created_at, updated_at, due_date, priority, status, title'),

    query('sort_order')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('sort_order must be ASC or DESC'),

    // pagination validation
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    // assigned_to validation
    query('assigned_to')
        .optional()
        .isInt()
        .withMessage('assigned_to must be an integer')
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
router.get('/', taskQueryValidation, handleValidationErrors, taskController.getAllTasks);
router.get('/assigned-to/:userId', param('userId').isInt().withMessage('User ID must be an integer'), taskController.getTasksByAssignee);
router.get('/:id', param('id').isInt().withMessage('Task ID must be an integer'), taskController.getTaskById);
router.post('/', createTaskValidation, handleValidationErrors, taskController.createTask);
router.put('/:id', param('id').isInt().withMessage('Task ID must be an integer'), updateTaskValidation, handleValidationErrors, taskController.updateTask);
router.put('/:id/assign', param('id').isInt().withMessage('Task ID must be an integer'), body('assigned_to').optional().isInt().withMessage('assigned_to must be an integer'), handleValidationErrors, taskController.assignTask);
router.patch('/:id/status', param('id').isInt().withMessage('Task ID must be an integer'), updateStatusValidation, handleValidationErrors, taskController.updateTaskStatus);
router.delete('/:id', param('id').isInt().withMessage('Task ID must be an integer'), taskController.deleteTask);

// export taskRoutes
module.exports = router;
