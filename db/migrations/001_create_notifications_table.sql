-- Migration: Create notifications table
-- Description: Table to store user notifications for task assignments, updates, etc.

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'assignment', 'update', 'completion', 'info'
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add comment to table
COMMENT ON TABLE notifications IS 'Stores user notifications for task-related events';

