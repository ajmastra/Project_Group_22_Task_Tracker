// global error handler middleware function
function errorHandler( err, req, res, next )
{
    // log error and stack
    console.log('Error occurred:', err.message);
    console.log('Stack:', err.stack);

    // default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error: ' + message;
    }

    // if json web token error, return 401 error
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    // if unauthorized error, return 401 error
    if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
    }

    // dont expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Something went wrong on our end';
    }

    // return error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// export errorHandler function
module.exports = errorHandler;
