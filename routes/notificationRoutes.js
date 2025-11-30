// import required modules
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

// all notification routes require authentication
router.use(verifyToken);

// --- VALIDATION ---
const notificationIdValidation = [
    param('id')
        .isInt()
        .withMessage('Notification ID must be an integer')
];

const createNotificationValidation = [
    body('user_id')
        .isInt()
        .withMessage('user_id must be an integer'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ max: 1000 })
        .withMessage('Message must be less than 1000 characters'),
    body('type')
        .optional()
        .isIn(['assignment', 'update', 'completion', 'info'])
        .withMessage('Type must be one of: assignment, update, completion, info'),
    body('task_id')
        .optional()
        .isInt()
        .withMessage('task_id must be an integer')
];

const notificationQueryValidation = [
    query('read_status')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('read_status must be true or false'),
    query('type')
        .optional()
        .isIn(['assignment', 'update', 'completion', 'info'])
        .withMessage('Invalid notification type'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
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
router.get('/', notificationQueryValidation, handleValidationErrors, notificationController.getAllNotifications);
router.get('/:id', notificationIdValidation, handleValidationErrors, notificationController.getNotificationById);
router.post('/', createNotificationValidation, handleValidationErrors, notificationController.createNotification);
router.patch('/:id/read', notificationIdValidation, handleValidationErrors, notificationController.markNotificationAsRead);
router.patch('/read-all', handleValidationErrors, notificationController.markAllNotificationsAsRead);
router.delete('/:id', notificationIdValidation, handleValidationErrors, notificationController.deleteNotification);

// export notificationRoutes
module.exports = router;

