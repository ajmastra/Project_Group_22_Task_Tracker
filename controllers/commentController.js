// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET COMMENTS FOR A TASK ---
async function getTaskComments( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const taskId = parseInt(req.params.taskId);

        // Validate taskId
        if ( isNaN(taskId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }

        // Verify user has access to this task
        const taskCheck = await query(
            'SELECT task_id FROM tasks WHERE task_id = $1 AND (created_by = $2 OR assigned_to = $2)',
            [taskId, userId]
        );

        if ( taskCheck.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to view it'
            });
        }

        // Get comments with user information
        const result = await query(
            `SELECT c.*, u.email, u.first_name, u.last_name
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.task_id = $1
             ORDER BY c.created_at ASC`,
            [taskId]
        );

        // Return success response
        res.json({
            success: true,
            count: result.rows.length,
            data: {
                comments: result.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get task comments error:', error);
        next(error);
    }
}

// --- CREATE COMMENT ---
async function createComment( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const taskId = parseInt(req.params.taskId);
        const { content } = req.body;

        // Validate required fields
        if ( !content || content.trim() === '' )
        {
            return res.status(400).json({
                success: false,
                error: 'Comment content is required'
            });
        }

        // Validate taskId
        if ( isNaN(taskId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID'
            });
        }

        // Verify user has access to this task
        const taskCheck = await query(
            'SELECT task_id FROM tasks WHERE task_id = $1 AND (created_by = $2 OR assigned_to = $2)',
            [taskId, userId]
        );

        if ( taskCheck.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to comment on it'
            });
        }

        // Insert comment
        const result = await query(
            'INSERT INTO comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [taskId, userId, content.trim()]
        );

        // Get comment with user information
        const commentWithUser = await query(
            `SELECT c.*, u.email, u.first_name, u.last_name
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.comment_id = $1`,
            [result.rows[0].comment_id]
        );

        // Log comment creation
        logInfo(`Comment created for task ${taskId} by user ${userId}`);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: {
                comment: commentWithUser.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Create comment error:', error);
        
        // Handle database constraint errors
        if ( error.code === '23503' )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid task_id or user_id'
            });
        }
        
        next(error);
    }
}

// --- UPDATE COMMENT ---
async function updateComment( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const commentId = parseInt(req.params.commentId);
        const { content } = req.body;

        // Validate required fields
        if ( !content || content.trim() === '' )
        {
            return res.status(400).json({
                success: false,
                error: 'Comment content is required'
            });
        }

        // Validate commentId
        if ( isNaN(commentId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid comment ID'
            });
        }

        // Verify user owns this comment
        const commentCheck = await query(
            'SELECT comment_id, task_id FROM comments WHERE comment_id = $1 AND user_id = $2',
            [commentId, userId]
        );

        if ( commentCheck.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Comment not found or you do not have permission to edit it'
            });
        }

        // Update comment
        const result = await query(
            'UPDATE comments SET content = $1 WHERE comment_id = $2 RETURNING *',
            [content.trim(), commentId]
        );

        // Get comment with user information
        const commentWithUser = await query(
            `SELECT c.*, u.email, u.first_name, u.last_name
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.comment_id = $1`,
            [commentId]
        );

        // Log comment update
        logInfo(`Comment ${commentId} updated by user ${userId}`);

        // Return success response
        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: {
                comment: commentWithUser.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Update comment error:', error);
        next(error);
    }
}

// --- DELETE COMMENT ---
async function deleteComment( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const commentId = parseInt(req.params.commentId);

        // Validate commentId
        if ( isNaN(commentId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid comment ID'
            });
        }

        // Verify user owns this comment
        const commentCheck = await query(
            'SELECT comment_id FROM comments WHERE comment_id = $1 AND user_id = $2',
            [commentId, userId]
        );

        if ( commentCheck.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Comment not found or you do not have permission to delete it'
            });
        }

        // Delete comment
        await query(
            'DELETE FROM comments WHERE comment_id = $1',
            [commentId]
        );

        // Log comment deletion
        logInfo(`Comment ${commentId} deleted by user ${userId}`);

        // Return success response
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    }
    catch ( error )
    {
        logError('Delete comment error:', error);
        next(error);
    }
}

// export commentController functions
module.exports = {
    getTaskComments,
    createComment,
    updateComment,
    deleteComment
};

