-- Migration: Add full-text search indexes for tasks
-- Description: Add GIN indexes for PostgreSQL full-text search on task titles and descriptions

-- Create a text search vector column for full-text search
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION tasks_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
DROP TRIGGER IF EXISTS tasks_search_vector_trigger ON tasks;
CREATE TRIGGER tasks_search_vector_trigger
    BEFORE INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION tasks_search_vector_update();

-- Update existing rows
UPDATE tasks SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_tasks_search_vector ON tasks USING GIN(search_vector);

-- Add index for due_date for date range queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Add index for created_at for sorting
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

