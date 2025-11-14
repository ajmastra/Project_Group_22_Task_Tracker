// import morgan for HTTP request logging
const morgan = require( 'morgan' );

// custom logger using Morgan - logs HTTP requests
const logger = morgan( 'combined' );

// simple console logger for application logs
function logInfo( message )
{
    console.log( `[INFO] ${new Date().toISOString()} - ${message}` );
}

// simple console logger for error logs
function logError( message, error )
{
    console.error( `[ERROR] ${new Date().toISOString()} - ${message}`, error );
}

// simple console logger for warning logs
function logWarn( message )
{
    console.warn( `[WARN] ${new Date().toISOString()} - ${message}` );
}

// export logger and log functions
module.exports = {
    logger,
    logInfo,
    logError,
    logWarn
};
