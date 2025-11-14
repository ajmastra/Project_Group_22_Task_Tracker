// import env for database connection
require('dotenv').config();
// import bcrypt for password hashing
const bcrypt = require('bcryptjs');
// import query function from config
const { query } = require('./config');


// function to seed the database with test users and tasks
async function seedDatabase() {

    // --- USER SEEDING ---
    // start try catch block on seed process
    try {

        // tell user seed is starting
        console.log( 'Starting database seed......' );

        // create test users with hashed password
        const passwordHash = await bcrypt.hash( 'password123', 10 );

        // create array of test users with email, password_hash, first_name, and last_name
        const users = [
            {
                email: 'spider.man@example.com',
                password_hash: passwordHash,
                first_name: 'Spider',
                last_name: 'Man'
            },
            {
                email: 'bat.man@example.com',
                password_hash: passwordHash,
                first_name: 'Bat',
                last_name: 'Man'
            },
            {
                email: 'test@example.com',
                password_hash: passwordHash,
                first_name: 'Test',
                last_name: 'User'
            } 
        ];

        // create array to store user ids
        const userIds = [];

        // insert users into database
        for (const user of users)
        {

            // start try catch block on user insertion
            try
            {

                // check if user exists
                const existingUser = await query (
                    // query to select user id from users table where email matches
                    'SELECT user_id FROM users WHERE email = $1',
                    [ user.email ]
                );

                // if user exists, add user id to userIds array
                if ( existingUser.rows.length > 0 )
                {
                    console.log( `User ${user.email} already exists, skipping...` );
                    userIds.push( existingUser.rows[ 0 ].user_id );
                }
                // if user does not exist, insert user into database and THEN add user id to userIds array
                else
                {
                    const result = await query (
                        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id',
                        [user.email, user.password_hash, user.first_name, user.last_name]
                    );

                    userIds.push( result.rows[0].user_id );
                    console.log( `Created user: ${user.email}` );
                }
                // if error, log and continue to next user
            }
            catch ( error )
            {
                console.error( `Error creating user ${user.email}:`, error.message );
            }
        }


        // --- TASK SEEDING ---
        // create test tasks with created_by, assigned_to, title, description, status, priority, and due_date
        const tasks = [
            {
                created_by: userIds[0],
                assigned_to: userIds[0],
                title: 'Complete Phase 1 backend tasks',
                description: 'Finish all backend API endpoints and test it!',
                status: 'in_progress',
                priority: 3,
                due_date: new Date('2025-11-14')
            },
            {
                created_by: userIds[0],
                assigned_to: userIds[0],
                title: 'Setup home media server',
                description: 'setup jellyfin and tailscale.',
                status: 'completed',
                priority: 3
            },
            {
                created_by: userIds[0],
                assigned_to: userIds[0],
                title: 'Write README',
                description: 'Create README in the group github',
                status: 'new',
                priority: 2
            },
            {
                created_by: userIds[1],
                assigned_to: userIds[1],
                title: 'Review code',
                description: 'check for bugs!',
                status: 'new',
                priority: 2
            },
            {
                created_by: userIds[1],
                assigned_to: userIds[0],
                title: 'Test auth flow',
                description: 'Test register, login, and protected routes',
                status: 'in_progress',
                priority: 3
            },
            {
                created_by: userIds[2],
                assigned_to: userIds[2],
                title: 'Sample task 1',
                description: 'This is a sample task for testing http',
                status: 'new',
                priority: 1
            },
            {
                created_by: userIds[2],
                assigned_to: userIds[2],
                title: 'Sample task 2',
                description: 'Another sample task',
                status: 'completed',
                priority: 2,
                due_date: new Date('2025-11-28')
            }
        ];

        // create variables to store number of tasks created and skipped
        let tasksCreated = 0;
        let tasksSkipped = 0;

        // insert tasks into database
        for ( const task of tasks )
        {
            // start try catch block on task insertion
            try
            {
                // check if similar task exists (simple check by title and creator)
                const existingTask = await query (
                    'SELECT task_id FROM tasks WHERE title = $1 AND created_by = $2',
                    [ task.title, task.created_by ]
                );

                // if similar task exists, add to tasksSkipped and continue to next task
                if ( existingTask.rows.length > 0 )
                {
                    tasksSkipped++;
                    continue;
                }

                // if similar task does not exist, insert task into database and increment tasksCreated
                await query(
                    `INSERT INTO tasks (created_by, assigned_to, title, description, status, priority, due_date)
                      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        task.created_by,
                        task.assigned_to || task.created_by, // default to creator if not assigned
                        task.title,
                        task.description,
                        task.status,
                        task.priority,
                        task.due_date || null
                    ]
                );

                tasksCreated++;

                console.log( `Created task: ${task.title}` );
                // if error, log and continue to next task
            }
            catch ( error )
            {
                console.error(`Error creating task "${task.title}":`, error.message);
            }
        }

        // log seed complete with # of users and tasks created and skipped
        console.log( '\nSeed completed!' );
        console.log( `Users: ${userIds.length} processed` );
        console.log( `Tasks: ${tasksCreated} created, ${tasksSkipped} skipped` );

        // print test credentials for api testing
        console.log( '\nTest Credentials:' );
        console.log( 'Email: test@example.com' );
        console.log( 'Password: password123' );
        console.log( '\nUse these credentials to test the API' );


    // if error, log and exit with code 1
    }
    catch ( error )
    {
        console.error( 'Seed error:', error );
        process.exit( 1 );
    }
}

// run seed function and handle errors
seedDatabase()
    .then(() => {
        console.log( 'Seeding finished' );
        process.exit(0);
    })
    .catch((error) => {
        console.error( 'Fatal error:', error );
        process.exit(1);
    });

