-- Migration: Create triggers for automatic notification creation
-- Description: Automatically create notifications when tasks are assigned or status changes

-- Function to create notification on task assignment
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification if assigned_to changed and is not NULL
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        INSERT INTO notifications (user_id, task_id, message, type)
        VALUES (
            NEW.assigned_to,
            NEW.task_id,
            'You have been assigned to task: ' || NEW.title,
            'assignment'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification on status change to completed
CREATE OR REPLACE FUNCTION notify_task_completed()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify creator when task is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO notifications (user_id, task_id, message, type)
        VALUES (
            NEW.created_by,
            NEW.task_id,
            'Task "' || NEW.title || '" has been completed',
            'completion'
        );
        
        -- Also notify assignee if different from creator
        IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != NEW.created_by THEN
            INSERT INTO notifications (user_id, task_id, message, type)
            VALUES (
                NEW.assigned_to,
                NEW.task_id,
                'Task "' || NEW.title || '" has been completed',
                'completion'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_task_assigned ON tasks;
CREATE TRIGGER trigger_notify_task_assigned
    AFTER UPDATE OF assigned_to ON tasks
    FOR EACH ROW
    WHEN (NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to))
    EXECUTE FUNCTION notify_task_assigned();

DROP TRIGGER IF EXISTS trigger_notify_task_completed ON tasks;
CREATE TRIGGER trigger_notify_task_completed
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION notify_task_completed();

