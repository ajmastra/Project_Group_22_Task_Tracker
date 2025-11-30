// import morgan for HTTP request logging
const morgan = require( 'morgan' );
const winston = require( 'winston' );
const path = require( 'path' );

// Configure Winston logger
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'taskhub-api' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    let msg = `${timestamp} [${level}]: ${message}`;
                    if (Object.keys(meta).length > 0) {
                        msg += ` ${JSON.stringify(meta)}`;
                    }
                    return msg;
                })
            )
        }),
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Write all logs to combined.log
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// If we're not in production, log to the console with simpler format
if (process.env.NODE_ENV !== 'production')
{
    winstonLogger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// custom logger using Morgan - logs HTTP requests
const logger = morgan( 'combined' );

// Enhanced logger functions using Winston
function logInfo( message, meta = {} )
{
    winstonLogger.info( message, meta );
}

function logError( message, error = {} )
{
    if (error instanceof Error)
    {
        winstonLogger.error( message, { 
            error: error.message, 
            stack: error.stack,
            ...error
        });
    }
    else
    {
        winstonLogger.error( message, error );
    }
}

function logWarn( message, meta = {} )
{
    winstonLogger.warn( message, meta );
}

function logDebug( message, meta = {} )
{
    winstonLogger.debug( message, meta );
}

// export logger and log functions
module.exports = {
    logger,
    logInfo,
    logError,
    logWarn,
    logDebug,
    winstonLogger
};
