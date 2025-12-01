// import required modules
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/authMiddleware');

// all comment routes require authentication
router.use(verifyToken);

// --- VALIDATION ---
const taskIdValidation = [
    param('taskId')
        .isInt()
        .withMessage('Task ID must be an integer')
];

const commentIdValidation = [
    param('commentId')
        .isInt()
        .withMessage('Comment ID must be an integer')
];

const createCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment must be between 1 and 2000 characters')
];

const updateCommentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ min: 1, max: 2000 })
        .withMessage('Comment must be between 1 and 2000 characters')
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
router.get('/task/:taskId', taskIdValidation, handleValidationErrors, commentController.getTaskComments);
router.post('/task/:taskId', taskIdValidation, createCommentValidation, handleValidationErrors, commentController.createComment);
router.put('/:commentId', commentIdValidation, updateCommentValidation, handleValidationErrors, commentController.updateComment);
router.delete('/:commentId', commentIdValidation, handleValidationErrors, commentController.deleteComment);

// export commentRoutes
module.exports = router;

