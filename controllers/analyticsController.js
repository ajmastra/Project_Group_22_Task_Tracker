// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET TASK COUNTS BY STATUS ---
async function getTasksByStatus( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { start_date, end_date } = req.query;

        // Build base query
        let sqlQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM tasks
            WHERE created_by = $1 OR assigned_to = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Add date filters
        if ( start_date )
        {
            sqlQuery += ` AND created_at >= $${paramIndex}`;
            queryParams.push(start_date);
            paramIndex++;
        }
        if ( end_date )
        {
            sqlQuery += ` AND created_at <= $${paramIndex}`;
            queryParams.push(end_date);
            paramIndex++;
        }

        sqlQuery += ' GROUP BY status ORDER BY count DESC';

        // Execute query
        const result = await query(sqlQuery, queryParams);

        // Format for Chart.js (pie/doughnut chart)
        const chartData = {
            labels: result.rows.map(row => row.status),
            datasets: [{
                data: result.rows.map(row => parseInt(row.count)),
                backgroundColor: [
                    '#3B82F6', // blue
                    '#10B981', // green
                    '#F59E0B', // amber
                    '#EF4444'  // red
                ]
            }]
        };

        // Return success response
        res.json({
            success: true,
            data: {
                summary: result.rows,
                chartData: chartData
            }
        });
    }
    catch ( error )
    {
        logError('Get tasks by status error:', error);
        next(error);
    }
}

// --- GET TASK DISTRIBUTION BY PRIORITY ---
async function getTasksByPriority( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { start_date, end_date } = req.query;

        // Build base query
        let sqlQuery = `
            SELECT 
                CASE 
                    WHEN priority = 1 THEN 'low'
                    WHEN priority = 2 THEN 'medium'
                    WHEN priority = 3 THEN 'high'
                    ELSE 'unknown'
                END as priority_label,
                priority,
                COUNT(*) as count
            FROM tasks
            WHERE created_by = $1 OR assigned_to = $1
        `;
        const queryParams = [userId];
        let paramIndex = 2;

        // Add date filters
        if ( start_date )
        {
            sqlQuery += ` AND created_at >= $${paramIndex}`;
            queryParams.push(start_date);
            paramIndex++;
        }
        if ( end_date )
        {
            sqlQuery += ` AND created_at <= $${paramIndex}`;
            queryParams.push(end_date);
            paramIndex++;
        }

        sqlQuery += ' GROUP BY priority ORDER BY priority DESC';

        // Execute query
        const result = await query(sqlQuery, queryParams);

        // Format for Chart.js (bar chart)
        const chartData = {
            labels: result.rows.map(row => row.priority_label),
            datasets: [{
                label: 'Tasks by Priority',
                data: result.rows.map(row => parseInt(row.count)),
                backgroundColor: [
                    '#10B981', // green for low
                    '#F59E0B', // amber for medium
                    '#EF4444'  // red for high
                ]
            }]
        };

        // Return success response
        res.json({
            success: true,
            data: {
                summary: result.rows,
                chartData: chartData
            }
        });
    }
    catch ( error )
    {
        logError('Get tasks by priority error:', error);
        next(error);
    }
}

// --- GET COMPLETION RATE OVER TIME ---
async function getCompletionRate( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;
        const { period = 'month', start_date, end_date } = req.query;

        // Validate period
        const validPeriods = ['day', 'week', 'month', 'year'];
        if ( !validPeriods.includes(period) )
        {
            return res.status(400).json({
                success: false,
                error: `period must be one of: ${validPeriods.join(', ')}`
            });
        }

        // Determine date format based on period
        let dateFormat;
        let dateTrunc;
        switch (period)
        {
            case 'day':
                dateFormat = 'YYYY-MM-DD';
                dateTrunc = 'day';
                break;
            case 'week':
                dateFormat = 'YYYY-"W"WW';
                dateTrunc = 'week';
                break;
            case 'month':
                dateFormat = 'YYYY-MM';
                dateTrunc = 'month';
                break;
            case 'year':
                dateFormat = 'YYYY';
                dateTrunc = 'year';
                break;
        }

        // Build query
        let sqlQuery = `
            SELECT 
                TO_CHAR(DATE_TRUNC($1, created_at), $2) as period,
                COUNT(*) as total_tasks,
                COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
                ROUND(
                    (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
                    2
                ) as completion_rate
            FROM tasks
            WHERE created_by = $3 OR assigned_to = $3
        `;
        const queryParams = [dateTrunc, dateFormat, userId];
        let paramIndex = 4;

        // Add date filters
        if ( start_date )
        {
            sqlQuery += ` AND created_at >= $${paramIndex}`;
            queryParams.push(start_date);
            paramIndex++;
        }
        if ( end_date )
        {
            sqlQuery += ` AND created_at <= $${paramIndex}`;
            queryParams.push(end_date);
            paramIndex++;
        }

        sqlQuery += ` GROUP BY DATE_TRUNC($1, created_at) ORDER BY period DESC LIMIT 12`;

        // Execute query
        const result = await query(sqlQuery, queryParams);

        // Format for Chart.js (line chart)
        const chartData = {
            labels: result.rows.map(row => row.period),
            datasets: [
                {
                    label: 'Total Tasks',
                    data: result.rows.map(row => parseInt(row.total_tasks)),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)'
                },
                {
                    label: 'Completed Tasks',
                    data: result.rows.map(row => parseInt(row.completed_tasks)),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)'
                },
                {
                    label: 'Completion Rate (%)',
                    data: result.rows.map(row => parseFloat(row.completion_rate || 0)),
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'y1'
                }
            ]
        };

        // Return success response
        res.json({
            success: true,
            period: period,
            data: {
                summary: result.rows,
                chartData: chartData
            }
        });
    }
    catch ( error )
    {
        logError('Get completion rate error:', error);
        next(error);
    }
}

// --- GET DASHBOARD SUMMARY ---
async function getDashboardSummary( req, res, next )
{
    // start try catch block
    try
    {
        const userId = req.user.user_id;

        // Get all statistics in parallel
        const [
            statusCounts,
            priorityCounts,
            totalTasks,
            completedTasks,
            overdueTasks,
            recentActivities
        ] = await Promise.all([
            // Status counts
            query(`
                SELECT status, COUNT(*) as count
                FROM tasks
                WHERE created_by = $1 OR assigned_to = $1
                GROUP BY status
            `, [userId]),
            // Priority counts
            query(`
                SELECT priority, COUNT(*) as count
                FROM tasks
                WHERE created_by = $1 OR assigned_to = $1
                GROUP BY priority
            `, [userId]),
            // Total tasks
            query(`
                SELECT COUNT(*) as total
                FROM tasks
                WHERE created_by = $1 OR assigned_to = $1
            `, [userId]),
            // Completed tasks
            query(`
                SELECT COUNT(*) as completed
                FROM tasks
                WHERE (created_by = $1 OR assigned_to = $1) AND status = 'completed'
            `, [userId]),
            // Overdue tasks
            query(`
                SELECT COUNT(*) as overdue
                FROM tasks
                WHERE (created_by = $1 OR assigned_to = $1) 
                AND due_date < CURRENT_TIMESTAMP 
                AND status != 'completed'
            `, [userId]),
            // Recent activities (last 5)
            query(`
                SELECT a.*, t.title as task_title
                FROM activities a
                JOIN tasks t ON a.task_id = t.task_id
                WHERE t.created_by = $1 OR t.assigned_to = $1
                ORDER BY a.created_at DESC
                LIMIT 5
            `, [userId])
        ]);

        // Calculate completion rate
        const total = parseInt(totalTasks.rows[0].total);
        const completed = parseInt(completedTasks.rows[0].completed);
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

        // Return success response
        res.json({
            success: true,
            data: {
                summary: {
                    total_tasks: total,
                    completed_tasks: completed,
                    overdue_tasks: parseInt(overdueTasks.rows[0].overdue),
                    completion_rate: parseFloat(completionRate)
                },
                status_breakdown: statusCounts.rows,
                priority_breakdown: priorityCounts.rows,
                recent_activities: recentActivities.rows
            }
        });
    }
    catch ( error )
    {
        logError('Get dashboard summary error:', error);
        next(error);
    }
}

// export analyticsController functions
module.exports = {
    getTasksByStatus,
    getTasksByPriority,
    getCompletionRate,
    getDashboardSummary
};

