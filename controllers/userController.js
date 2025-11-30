// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET ALL USERS ---
async function getAllUsers( req, res, next )
{
    // start try catch block
    try
    {
        // Get query parameters for pagination
        const { page = 1, limit = 50, search } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));

        // Build base query
        let sqlQuery = 'SELECT user_id, email, first_name, last_name, created_at FROM users';
        const queryParams = [];
        let paramIndex = 1;

        // Add search filter if provided
        if ( search && search.trim() !== '' )
        {
            sqlQuery += ` WHERE (email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
            queryParams.push(`%${search.trim()}%`);
            paramIndex++;
        }

        // Get total count for pagination
        const countQuery = search 
            ? sqlQuery.replace(/SELECT user_id, email, first_name, last_name, created_at/, 'SELECT COUNT(*) as total')
            : 'SELECT COUNT(*) as total FROM users';
        const countResult = await query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        sqlQuery += ' ORDER BY created_at DESC';
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
                users: result.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get all users error:', error);
        next(error);
    }
}

// --- GET USER BY ID ---
async function getUserById( req, res, next )
{
    // start try catch block
    try
    {
        const userId = parseInt(req.params.id);

        // Validate userId
        if ( isNaN(userId) )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // Get user from database (exclude password_hash)
        const result = await query(
            'SELECT user_id, email, first_name, last_name, created_at FROM users WHERE user_id = $1',
            [userId]
        );

        // If user not found, return 404 error
        if ( result.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Return success response
        res.json({
            success: true,
            data: {
                user: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Get user by ID error:', error);
        next(error);
    }
}

// export userController functions
module.exports = {
    getAllUsers,
    getUserById
};

