-- Migration: Fix activities foreign key to preserve deletion records
-- Description: Change the foreign key constraint to SET NULL instead of CASCADE
-- so that deletion activity records are preserved even after the task is deleted

-- First, drop the existing foreign key constraint
ALTER TABLE activities 
    DROP CONSTRAINT IF EXISTS activities_task_id_fkey;

-- Recreate the foreign key with ON DELETE SET NULL
-- This allows the activity record to remain even after task deletion
ALTER TABLE activities
    ADD CONSTRAINT activities_task_id_fkey 
    FOREIGN KEY (task_id) 
    REFERENCES tasks(task_id) 
    ON DELETE SET NULL;

-- Note: We need to make task_id nullable for this to work
ALTER TABLE activities 
    ALTER COLUMN task_id DROP NOT NULL;

