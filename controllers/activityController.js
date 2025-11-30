// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET ACTIVITIES FOR A TASK ---
async function getTaskActivities( req, res, next )
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

        // Get activities with user information
        const result = await query(
            `SELECT a.*, u.email, u.first_name, u.last_name
             FROM activities a
             JOIN users u ON a.user_id = u.user_id
             WHERE a.task_id = $1
             ORDER BY a.created_at DESC`,
            [taskId]
        );

        // Return success response
        res.json({
            success: true,
            count: result.rows.length,
            data: {
                activities: result.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get task activities error:', error);
        next(error);
    }
}

// --- GET ALL ACTIVITIES FOR CURRENT USER'S TASKS ---
async function getUserActivities( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { page = 1, limit = 50, action } = req.query;

        // Build base query
        let sqlQuery = `
            SELECT a.*, u.email, u.first_name, u.last_name, t.title as task_title
            FROM activities a
            JOIN users u ON a.user_id = u.user_id
            JOIN tasks t ON a.task_id = t.task_id
            WHERE t.created_by = $1 OR t.assigned_to = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Add action filter
        if ( action )
        {
            sqlQuery += ` AND a.action = $${paramIndex}`;
            queryParams.push(action);
            paramIndex++;
        }

        // Get total count
        const countQuery = sqlQuery.replace(/SELECT a\.\*, u\.email, u\.first_name, u\.last_name, t\.title as task_title/, 'SELECT COUNT(*) as total');
        const countResult = await query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        sqlQuery += ' ORDER BY a.created_at DESC';
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, (pageNum - 1) * limitNum);

        // Execute query
        const result = await query(sqlQuery, queryParams);

        // Return success response
        res.json({
            success: true,
            count: result.rows.length,
            total: totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
            data: {
                activities: result.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get user activities error:', error);
        next(error);
    }
}

// --- CREATE ACTIVITY (MANUALLY) ---
async function createActivity( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { task_id, action, description } = req.body;

        // Validate required fields
        if ( !task_id || !action )
        {
            return res.status(400).json({
                success: false,
                error: 'task_id and action are required'
            });
        }

        // Verify user has access to this task
        const taskCheck = await query(
            'SELECT task_id FROM tasks WHERE task_id = $1 AND (created_by = $2 OR assigned_to = $2)',
            [task_id, userId]
        );

        if ( taskCheck.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to add activities'
            });
        }

        // Insert activity
        const result = await query(
            'INSERT INTO activities (task_id, user_id, action, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [task_id, userId, action, description || null]
        );

        // Log activity creation
        logInfo(`Activity created for task ${task_id} by user ${userId}`);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            data: {
                activity: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Create activity error:', error);
        
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

// export activityController functions
module.exports = {
    getTaskActivities,
    getUserActivities,
    createActivity
};

