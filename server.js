// import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter, authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeInput } = require('./middleware/sanitizeInput');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const commentRoutes = require('./routes/commentRoutes');

// load environment variables
dotenv.config();

// create express app
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // enable CORS for all routes
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies
app.use(sanitizeInput); // sanitize all inputs
app.use(generalLimiter); // apply general rate limiting
app.use(logger); // http request logging

// test database connection
const { query } = require('./db/config');

// test database connection
async function testDatabaseConnection()
{
    // start try catch block on database connection test
    try
    {
        // execute query
        await query('SELECT NOW()');

        // log success
        console.log('Database connection test successful');
    }
    catch ( error )
    {
        console.error( 'Database connection test failed:', error.message );
        process.exit(1);
    }
}

// --- ROUTES ---
app.get('/', ( req, res ) => {
    // return success response
    res.json({
        success: true,
        message: 'TaskHub API is running',
        version: '1.0.0',
            endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            users: '/api/users',
            notifications: '/api/notifications',
            activities: '/api/activities',
            analytics: '/api/analytics',
            comments: '/api/comments'
        }
    });
});

// --- API ROUTES ---
// Authentication routes with strict rate limiting
app.use( '/api/auth', authLimiter, authRoutes );

// API routes with general rate limiting
app.use( '/api/tasks', apiLimiter, taskRoutes );
app.use( '/api/users', apiLimiter, userRoutes );
app.use( '/api/notifications', apiLimiter, notificationRoutes );
app.use( '/api/activities', apiLimiter, activityRoutes );
app.use( '/api/analytics', apiLimiter, analyticsRoutes );
app.use( '/api/comments', apiLimiter, commentRoutes );

// --- 404 HANDLER ---
app.use(( req, res ) => {
    // return 404 error response
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use(errorHandler);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;


async function startServer()
{
    // test database connection first
    await testDatabaseConnection();
    
    // start server
    app.listen( PORT, () => {
        // log success
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

// --- HANDLE UNHANDLED PROMISE REJECTIONS ---
process.on('unhandledRejection', (err) => {
    // log error
    console.error('Unhandled Promise Rejection:', err);
    // exit process
    process.exit(1);
});

// --- HANDLE UNCAUGHT EXCEPTIONS ---
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});


startServer();
