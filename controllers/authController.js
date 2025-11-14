// import required modules
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/config');
const { logInfo, logError } = require('../utils/logger');

// --- USER REGISTRATION ---
async function register( req, res, next )
{
    // start try catch block on user registration
    try
    {
        // get user data from request body
        const { email, password, first_name, last_name } = req.body;

        // check if user already exists with query
        const existingUser = await query(
            'SELECT user_id FROM users WHERE email = $1',
            [email]
        );

        // if user already exists, return 400 error
        if ( existingUser.rows.length > 0 ) {
            return res.status( 400 ).json({
                success: false,
                error: 'This email is already registered, please use another one'
            });
        }

        // hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash( password, saltRounds );

        // Insert new user
        const result = await query(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id, email, first_name, last_name, created_at',
            [email, passwordHash, first_name || null, last_name || null]
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign (
            { userId: newUser.user_id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        logInfo( `New user registered: ${email}` );

        res.status( 201 ).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    user_id: newUser.user_id,
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name
                },
                token: token
            }
        });
    } 
    catch ( error )
    {
        logError( 'Registration error:', error );
        next( error );
    }
}

// --- USER LOGIN ---
async function login( req, res, next )
{
    // start try catch block on user login
    try
    {
        // get user data from request body
        const { email, password } = req.body;

        // find user by email
        const userResult = await query(
            'SELECT user_id, email, password_hash, first_name, last_name FROM users WHERE email = $1',
            [email]
        );

        // if user not found, return 401 error
        if ( userResult.rows.length === 0 )
        {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // get user from result
        const user = userResult.rows[0];

        // compare password
        const isPasswordValid = await bcrypt.compare( password, user.password_hash );

        // if password is invalid, return 401 error
        if (!isPasswordValid)
        {
            return res.status( 401 ).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // generate JWT token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // log user login
        logInfo( `User logged in: ${email}` );

        // return success response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                token: token
            }
        });
    }
    catch ( error )
    {
        logError( 'Login error:', error );
        next( error );
    }
}

// --- GET CURRENT USER PROFILE ---
async function getProfile( req, res, next )
{
    // start try catch block on get profile
    try
    {
        // user info is already attached by auth middleware
        const userResult = await query(
            'SELECT user_id, email, first_name, last_name, created_at FROM users WHERE user_id = $1',
            [req.user.user_id]
        );

        // if user not found, return 404 error
        if ( userResult.rows.length === 0 )
        {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // return success response
        res.json({
            success: true,
            data: {
                user: userResult.rows[0]
            }
        });
    }
    catch ( error )
    {
        logError('Get profile error:', error);
        next(error);
    }
}

// export authController functions
module.exports = {
    register,
    login,
    getProfile
};
