CREATE INDEX IF NOT EXISTS idx_subtasks_task_id_completed ON subtasks(task_id, is_completed);
