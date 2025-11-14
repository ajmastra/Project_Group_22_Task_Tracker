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

    // status validation
    query('status')
        .optional()
        .isIn(['new', 'in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status filter'),

    // priority validation
    query('priority')
        .optional()
        .custom((value) => {
            // Accept string ('low', 'medium', 'high') or integer (1, 2, 3)
            if ( typeof value === 'string' )
            {
                return ['low', 'medium', 'high'].includes(value) || !isNaN(parseInt(value));
            }
            return true;
        })
        .withMessage('Invalid priority filter')
];

// --- VALIDATION ERROR HANDLER ---
function handleValidationErrors( req, res, next )
{
    // for now, basic validation is done in controller
    // in a phase2 implementation, we'd check validationResult here
    next();
}

// --- ROUTES ---
router.get('/', taskQueryValidation, handleValidationErrors, taskController.getAllTasks);
router.get('/:id', param('id').isInt().withMessage('Task ID must be an integer'), taskController.getTaskById);
router.post('/', createTaskValidation, handleValidationErrors, taskController.createTask);
router.put('/:id', param('id').isInt().withMessage('Task ID must be an integer'), updateTaskValidation, handleValidationErrors, taskController.updateTask);
router.patch('/:id/status', param('id').isInt().withMessage('Task ID must be an integer'), updateStatusValidation, handleValidationErrors, taskController.updateTaskStatus);
router.delete('/:id', param('id').isInt().withMessage('Task ID must be an integer'), taskController.deleteTask);

// export taskRoutes
module.exports = router;
