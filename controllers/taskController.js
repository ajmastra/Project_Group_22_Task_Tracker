// import required modules
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- GET ALL TASKS ---
async function getAllTasks( req, res, next )
{
    // start try catch block on get all tasks
    try
    {
        // get user id from request
        const userId = req.user.user_id;
        const { status, priority } = req.query;

        // build query - user can see tasks they created OR are assigned to
        let sqlQuery = 'SELECT * FROM tasks WHERE created_by = $1 OR assigned_to = $1';
        const queryParams = [userId];
        let paramIndex = 2;

        // if status is provided, add to query
        if ( status )
        {
            sqlQuery += ` AND status = $${paramIndex}`;
            queryParams.push(status);
            paramIndex++;
        }

        // if priority is provided, add to query
        if ( priority )
        {
            // Convert string priority to integer if needed
            let priorityInt = priority;
            if ( typeof priority === 'string' )
            {
                priorityInt = priority === 'low' ? 1 : priority === 'medium' ? 2 : priority === 'high' ? 3 : parseInt( priority );
            }
            sqlQuery += ` AND priority = $${paramIndex}`;
            queryParams.push( priorityInt );
            paramIndex++;
        }

        // add order by created_at descending to query
        sqlQuery += ' ORDER BY created_at DESC';

        // execute query
        const result = await query(sqlQuery, queryParams);

        // return success response
        res.json({
            success: true,
            count: result.rows.length,
            data: {
                tasks: result.rows
            }
        });
    }
    catch ( error )
    {
        // log error
        logError('Get all tasks error:', error);
        next(error);
    }
}

// --- GET SINGLE TASK BY ID ---
async function getTaskById( req, res, next )
{
    // start try catch block on get task by id
    try
    {
        // get user id from request
        const userId = req.user.user_id;
        const taskId = req.params.id;

        // build query - user can see tasks they created OR are assigned to
        const result = await query(
            'SELECT * FROM tasks WHERE task_id = $1 AND (created_by = $2 OR assigned_to = $2)',
            [taskId, userId]
        );

        // if task not found, return 404 error
        if ( result.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to view it'
            });
        }

        // return success response
        res.json({
            success: true,
            data: {
                task: result.rows[0]
            }
        });
    }
    catch (error)
    {
        logError('Get task by ID error:', error);
        next(error);
    }
}

// --- CREATE NEW TASK ---
async function createTask( req, res, next )
{
    try
    {
        // get user id from request
        const userId = req.user.user_id;
        const { title, description, status, priority, due_date, assigned_to } = req.body;

        // validate required fields
        if ( !title || title.trim() === '' )
        {
            // if title is required, return 400 error
            return res.status(400).json({
                success: false,
                error: 'Task title is required'
            });
        }

        // set default priority to 2
        let priorityInt = 2; 

        // if priority is provided, convert to integer
        if ( priority !== undefined )
        {
            // if priority is provided, convert to integer
            if ( typeof priority === 'string' )
            {
                priorityInt = priority === 'low' ? 1 : priority === 'medium' ? 2 : priority === 'high' ? 3 : 2;
            }
            else
            {
                priorityInt = priority || 2;
            }
        }

        // insert task into database
        const result = await query(
            `INSERT INTO tasks (created_by, assigned_to, title, description, status, priority, due_date) 
              VALUES ($1, $2, $3, $4, $5, $6, $7) 
              RETURNING *`,
            [
                userId,
                assigned_to || userId, // default to creator if not assigned
                title.trim(),
                description || null,
                status || 'new',
                priorityInt,
                due_date || null
            ]
        );

        // get new task from result
        const newTask = result.rows[0];

        // log task creation
        logInfo( `Task created: ${newTask.task_id} by user ${userId}` );

        // return success response
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                task: newTask
            }
        });
    }
    catch ( error )
    {
        logError( 'Create task error:', error );
        
        // handle database constraint errors
        if (error.code === '23503')
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID for assigned_to'
            });
        }
        
        next(error);
    }
}

// --- UPDATE ENTIRE TASK ---
async function updateTask( req, res, next )
{
    // start try catch block on update task
    try
    {
        // get user id from request
        const userId = req.user.user_id;
        const taskId = req.params.id;
        const { title, description, status, priority, due_date, assigned_to } = req.body;

        // first check if task exists and user has permission (created it)
        const checkResult = await query(
            'SELECT task_id FROM tasks WHERE task_id = $1 AND created_by = $2',
            [taskId, userId]
        );

        // if task not found, return 404 error
        if ( checkResult.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to modify it'
            });
        }

        // build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        // if title is provided, add to query
        if ( title !== undefined )
        {
            updates.push(`title = $${paramIndex++}`);
            values.push(title.trim());
        }

        // if description is provided, add to query
        if ( description !== undefined )
        {
            updates.push( `description = $${paramIndex++}` );
            values.push( description || null );
        }

        // if status is provided, add to query
        if ( status !== undefined )
        {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        // if priority is provided, add to query
        if ( priority !== undefined )
        {
            // convert priority string to integer if needed
            let priorityInt = priority;
            if ( typeof priority === 'string' )
            {
                priorityInt = priority === 'low' ? 1 : priority === 'medium' ? 2 : priority === 'high' ? 3 : parseInt( priority );
            }
            updates.push( `priority = $${paramIndex++}` );
            values.push( priorityInt );
        }
        // if due date is provided, add to query
        if ( due_date !== undefined )
        {
            updates.push( `due_date = $${paramIndex++}` );
            values.push( due_date || null );
        }
        if ( assigned_to !== undefined ) {
            updates.push( `assigned_to = $${paramIndex++}` );
            values.push( assigned_to || null );
        }

        // if no fields to update, return 400 error
        if ( updates.length === 0 )
        {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        // add task id to values array
        values.push(taskId);

        // update task in database
        const result = await query(
            `UPDATE tasks 
              SET ${updates.join(', ')} 
              WHERE task_id = $${paramIndex}
              RETURNING *`,
            values
        );

        // log task update
        logInfo(`Task updated: ${taskId} by user ${userId}`);

        // return success response
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: {
                task: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError( 'Update task error:', error);
        

        // handle database constraint errors
        if ( error.code === '23503' )
        {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID for assigned_to'
            });
        }
        
        next(error);
    }
}

// --- UPDATE TASK STATUS ONLY (CAN BE DONE BY CREATOR OR ASSIGNEE) ---
async function updateTaskStatus( req, res, next )
{
    // start try catch block on update task status
    try
    {
        // get user id from request
        const userId = req.user.user_id;
        const taskId = req.params.id;
        const { status } = req.body;

        // if status is not provided, return 400 error
        if ( !status )
        {
            return res.status(400).json({
                success: false,
                error: 'Status field is required'
            });
        }

        // Check if task exists and user has access (created or assigned)
        const checkResult = await query(
            'SELECT task_id FROM tasks WHERE task_id = $1 AND (created_by = $2 OR assigned_to = $2)',
            [taskId, userId]
        );

        // if task not found, return 404 error
        if ( checkResult.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to modify it'
            });
        }

        // update task status in database
        const result = await query(
            'UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING *',
            [status, taskId]
        );

        // log task status update
        logInfo( `Task status updated: ${taskId} to ${status}` );

        // return success response
        res.json({
            success: true,
            message: 'Task status updated successfully',
            data: {
                task: result.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Update task status error:', error);
        next(error);
    }
}

// --- DELETE TASK (ONLY CREATOR CAN DELETE) ---
async function deleteTask( req, res, next )
{
    // start try catch block on delete task
    try {

        // get user id from request
        const userId = req.user.user_id;
        const taskId = req.params.id;

        // check if task exists and user created it
        const checkResult = await query(
            'SELECT task_id, title FROM tasks WHERE task_id = $1 AND created_by = $2',
            [taskId, userId]
        );

        // if task not found, return 404 error
        if ( checkResult.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'Task not found or you do not have permission to delete it'
            });
        }

        // delete task from database
        await query(
            'DELETE FROM tasks WHERE task_id = $1',
            [taskId]
        );

        // log task deletion
        logInfo(`Task deleted: ${taskId} by user ${userId}`);

        // return success response
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch ( error )
    {
        // log error
        logError('Delete task error:', error);
        next(error);
    }
}

// export taskController functions
module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
};

