// import jsonwebtoken for token verification
const jwt = require('jsonwebtoken');
const { query } = require('../db/config');

// middleware to verify jwt token
async function verifyToken(req, res, next)
{
    // start try catch block on token verification
    try
    {
        // get token from header
        const authHeader = req.headers.authorization;
        
        // if no token provided, return 401 error
        if ( !authHeader )
        {
            return res.status( 401 ).json({ 
                success: false, 
                error: 'No token provided! please login first' 
            });
        }

        // extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        // if no token provided, return 401 error
        if ( !token )
        {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token format' 
            });
        }

        // verify token
        const decoded = jwt.verify( token, process.env.JWT_SECRET );
        
        // check if user still exists in database
        const userResult = await query(
            'SELECT user_id, email, first_name, last_name FROM users WHERE user_id = $1',
            [decoded.userId]
        );

        // if user not found, return 401 error
        if ( userResult.rows.length === 0 )
        {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // attach user info to request object
        req.user = {
            user_id: userResult.rows[0].user_id,
            email: userResult.rows[0].email,
            first_name: userResult.rows[0].first_name,
            last_name: userResult.rows[0].last_name
        };

        next();
    }
    catch ( error )
    {
        // log error
        console.log( 'Auth middleware error:', error.message );

        // if token expired, return 401 error
        if ( error.name === 'TokenExpiredError' )
        {
            return res.status( 401 ).json({ 
                success: false, 
                error: 'Token expired, please login again' 
            });
        }
        
        // if invalid token, return 401 error
        return res.status( 401 ).json({ 
            success: false, 
            error: 'Invalid or expired token' 
        });
    }
}

// export verifyToken function
module.exports = {
    verifyToken
};

