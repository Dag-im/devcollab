-- No transaction wrapper — CONCURRENTLY cannot run inside BEGIN/COMMIT

-- tasks: project lookup (most frequent query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_id_active
  ON tasks (project_id)
  WHERE deleted_at IS NULL;

-- tasks: project + status for filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status_active
  ON tasks (project_id, status)
  WHERE deleted_at IS NULL;

-- comments: task lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_task_id_active
  ON comments (task_id)
  WHERE deleted_at IS NULL;

-- refresh tokens: hash lookup on active tokens
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_hash_active
  ON refresh_tokens (token_hash)
  WHERE revoked_at IS NULL;

-- members: user lookup for workspace list and guard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_user_id_active
  ON members (user_id)
  WHERE deleted_at IS NULL;

-- members: workspace lookup for member lists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_members_workspace_id_active
  ON members (workspace_id)
  WHERE deleted_at IS NULL;

-- projects: workspace lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_workspace_id_active
  ON projects (workspace_id)
  WHERE deleted_at IS NULL;

-- notifications: unread lookup by user (Brick 14)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id_unread
  ON notifications (user_id)
  WHERE status = 'UNREAD';
