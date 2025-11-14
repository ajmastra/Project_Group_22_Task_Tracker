// import pool from pg for database connection
const { Pool } = require('pg');
require('dotenv').config();

// create connection pool
const pool = new Pool({

    // supabase credentials
    host: process.env.SUPABASE_HOST,
    port: process.env.SUPABASE_PORT || 5432,
    database: process.env.SUPABASE_DATABASE,
    user: process.env.SUPABASE_USER,
    password: process.env.SUPABASE_PASSWORD,
    ssl: {
        rejectUnauthorized: false // supabase requires SSL
    },
    max: 20, // max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// test the actual connection, and log success
pool.on('connect', () => {
    console.log('Connected to database successfully');
});

// if error, log and exit with code -1
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// helper function to run queries
async function query(text, params) {

    // start timer to measure query execution time
    const start = Date.now();

    // start try catch block on query execution
    try
    {
        // execute query
        const res = await pool.query(text, params);

        // calculate query execution time
        const duration = Date.now() - start;

        // log query execution time and result
        console.log('Executed query', { text, duration, rows: res.rowCount });
        
        // return query result
        return res;

    } 
    catch (error)
    {
        console.error('Query error:', error);
        throw error;
    }
}

module.exports = {
    query,
    pool
};