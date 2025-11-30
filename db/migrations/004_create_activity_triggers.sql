-- Migration: Create triggers for automatic activity logging
-- Description: Automatically log activities when tasks are created, updated, or deleted

-- Function to log task creation
CREATE OR REPLACE FUNCTION log_task_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activities (task_id, user_id, action, description)
    VALUES (
        NEW.task_id,
        NEW.created_by,
        'created',
        'Task "' || NEW.title || '" was created'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log task updates
CREATE OR REPLACE FUNCTION log_task_updated()
RETURNS TRIGGER AS $$
DECLARE
    changes TEXT := '';
BEGIN
    -- Track what changed
    IF OLD.title IS DISTINCT FROM NEW.title THEN
        changes := changes || 'Title changed from "' || OLD.title || '" to "' || NEW.title || '". ';
    END IF;
    
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        changes := changes || 'Status changed from "' || OLD.status || '" to "' || NEW.status || '". ';
    END IF;
    
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
        changes := changes || 'Priority changed. ';
    END IF;
    
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
        IF NEW.assigned_to IS NULL THEN
            changes := changes || 'Task unassigned. ';
        ELSE
            changes := changes || 'Task reassigned. ';
        END IF;
    END IF;
    
    IF changes = '' THEN
        changes := 'Task details updated.';
    END IF;
    
    INSERT INTO activities (task_id, user_id, action, description)
    VALUES (
        NEW.task_id,
        NEW.created_by,
        'updated',
        changes
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log task deletion
CREATE OR REPLACE FUNCTION log_task_deleted()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activities (task_id, user_id, action, description)
    VALUES (
        OLD.task_id,
        OLD.created_by,
        'deleted',
        'Task "' || OLD.title || '" was deleted'
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_log_task_created ON tasks;
CREATE TRIGGER trigger_log_task_created
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_created();

DROP TRIGGER IF EXISTS trigger_log_task_updated ON tasks;
CREATE TRIGGER trigger_log_task_updated
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_updated();

DROP TRIGGER IF EXISTS trigger_log_task_deleted ON tasks;
CREATE TRIGGER trigger_log_task_deleted
    AFTER DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_deleted();

