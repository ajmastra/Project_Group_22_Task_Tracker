// Migration runner script
// Run this script to apply all database migrations
// Usage: node db/run-migrations.js

const { query } = require('./config');
const fs = require('fs');
const path = require('path');

async function runMigrations()
{
    try
    {
        console.log('Starting database migrations...\n');

        // Get all migration files sorted by name
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration files\n`);

        // Run each migration
        for ( const file of migrationFiles )
        {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            console.log(`Running migration: ${file}...`);
            
            try
            {
                await query(sql);
                console.log(`✓ Successfully applied: ${file}\n`);
            }
            catch (error)
            {
                // Some errors are expected (e.g., IF NOT EXISTS)
                if (error.message.includes('already exists') || error.message.includes('does not exist'))
                {
                    console.log(`⚠ Skipped (already applied or not applicable): ${file}\n`);
                }
                else
                {
                    console.error(`✗ Error applying ${file}:`, error.message);
                    throw error;
                }
            }
        }

        console.log('All migrations completed successfully!');
        process.exit(0);
    }
    catch (error)
    {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migrations
runMigrations();

