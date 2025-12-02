-- Migration: Fix delete trigger to run BEFORE DELETE
-- Description: Change the delete trigger to run BEFORE DELETE so the activity can be logged
-- before the task is deleted and the foreign key constraint is violated

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trigger_log_task_deleted ON tasks;

-- Recreate the trigger to run BEFORE DELETE
CREATE TRIGGER trigger_log_task_deleted
    BEFORE DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_deleted();

