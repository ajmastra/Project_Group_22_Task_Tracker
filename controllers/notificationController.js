// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET ALL NOTIFICATIONS FOR CURRENT USER ---
async function getAllNotifications( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { read_status, type, page = 1, limit = 50 } = req.query;

        // Build base query
        let sqlQuery = `
            SELECT n.*, t.title as task_title, t.status as task_status
            FROM notifications n
            LEFT JOIN tasks t ON n.task_id = t.task_id
            WHERE n.user_id = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Add filters
        if ( read_status !== undefined )
        {
            const isRead = read_status === 'true' || read_status === true;
            sqlQuery += ` AND n.read_status = $${paramIndex}`;
            queryParams.push(isRead);
            paramIndex++;
        }

        if ( type )
        {
            sqlQuery += ` AND n.type = $${paramIndex}`;
            queryParams.push(type);
            paramIndex++;
        }

        // Get total count
        const countQuery = sqlQuery.replace(/SELECT n\.\*, t\.title as task_title, t\.status as task_status/, 'SELECT COUNT(*) as total');
        const countResult = await query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        sqlQuery += ' ORDER BY n.created_at DESC';
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limitNum, (pageNum - 1) * limitNum);

        // Execute query
        const result = await query(sqlQuery, queryParams);

        // Get unread count
        const unreadResult = await query(
            'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND read_status = false',
            [userId]
        );
        const unreadCount = parseInt(unreadResult.rows[0].unread_count);

        // Return success response
        res.json({
            success: true,
            count: result.rows.length,
            total: totalCount,
            unread_count: unreadCount,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalCount / limitNum),
            data: {
                notifications: result.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get all notifications error:', error);
        next(error);
    }
}

// --- GET NOTIFICATION BY ID ---
async function getNotificationById( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const notificationId = parseInt(req.params.id);

        // Validate notificationId
        if ( isNaN(notificationId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid notification ID'
            });
        }

        // Get notification
        const result = await query(
            `SELECT n.*, t.title as task_title, t.status as task_status
             FROM notifications n
             LEFT JOIN tasks t ON n.task_id = t.task_id
             WHERE n.id = $1 AND n.user_id = $2`,
            [notificationId, userId]
        );

        // If notification not found, return 404 error
        if ( result.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        // Return success response
        res.json({
            success: true,
            data: {
                notification: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Get notification by ID error:', error);
        next(error);
    }
}

// --- CREATE NOTIFICATION (MANUALLY) ---
async function createNotification( req, res, next )
{
    // start try catch block
    try
    {
        const { user_id, task_id, message, type = 'info' } = req.body;

        // Validate required fields
        if ( !user_id || !message )
        {
            return res.status(400).json({
                success: false,
                error: 'user_id and message are required'
            });
        }

        // Validate type
        const validTypes = ['assignment', 'update', 'completion', 'info'];
        if ( !validTypes.includes(type) )
        {
            return res.status(400).json({
                success: false,
                error: `type must be one of: ${validTypes.join(', ')}`
            });
        }

        // Insert notification
        const result = await query(
            'INSERT INTO notifications (user_id, task_id, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, task_id || null, message, type]
        );

        // Log notification creation
        logInfo(`Notification created for user ${user_id}`);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: {
                notification: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Create notification error:', error);
        
        // Handle database constraint errors
        if ( error.code === '23503' )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id or task_id'
            });
        }
        
        next(error);
    }
}

// --- MARK NOTIFICATION AS READ ---
async function markNotificationAsRead( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const notificationId = parseInt(req.params.id);

        // Validate notificationId
        if ( isNaN(notificationId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid notification ID'
            });
        }

        // Update notification
        const result = await query(
            'UPDATE notifications SET read_status = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [notificationId, userId]
        );

        // If notification not found, return 404 error
        if ( result.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        // Return success response
        res.json({
            success: true,
            message: 'Notification marked as read',
            data: {
                notification: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Mark notification as read error:', error);
        next(error);
    }
}

// --- MARK ALL NOTIFICATIONS AS READ ---
async function markAllNotificationsAsRead( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;

        // Update all notifications
        const result = await query(
            'UPDATE notifications SET read_status = true WHERE user_id = $1 AND read_status = false RETURNING id',
            [userId]
        );

        // Return success response
        res.json({
            success: true,
            message: `${result.rows.length} notifications marked as read`,
            data: {
                count: result.rows.length
            }
        });
    }
    catch ( error )
    {
        logError('Mark all notifications as read error:', error);
        next(error);
    }
}

// --- DELETE NOTIFICATION ---
async function deleteNotification( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const notificationId = parseInt(req.params.id);

        // Validate notificationId
        if ( isNaN(notificationId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid notification ID'
            });
        }

        // Check if notification exists and belongs to user
        const checkResult = await query(
            'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
            [notificationId, userId]
        );

        // If notification not found, return 404 error
        if ( checkResult.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        // Delete notification
        await query(
            'DELETE FROM notifications WHERE id = $1',
            [notificationId]
        );

        // Log deletion
        logInfo(`Notification ${notificationId} deleted by user ${userId}`);

        // Return success response
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch ( error )
    {
        logError('Delete notification error:', error);
        next(error);
    }
}

// export notificationController functions
module.exports = {
    getAllNotifications,
    getNotificationById,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};

