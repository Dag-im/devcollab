-- tasks: most frequent query pattern
CREATE INDEX idx_tasks_project_id_active
  ON tasks (project_id)
  WHERE deleted_at IS NULL;

-- tasks: also index status for filtered queries
CREATE INDEX idx_tasks_project_status_active
  ON tasks (project_id, status)
  WHERE deleted_at IS NULL;

-- comments: always queried by task
CREATE INDEX idx_comments_task_id_active
  ON comments (task_id)
  WHERE deleted_at IS NULL;

-- refresh tokens: frequent lookup, most tokens are eventually revoked
CREATE INDEX idx_refresh_tokens_hash_active
  ON refresh_tokens (token_hash)
  WHERE revoked_at IS NULL;

-- members: user lookup for workspace list and guard
CREATE INDEX idx_members_user_id_active
  ON members (user_id)
  WHERE deleted_at IS NULL;

-- members: workspace lookup for member lists
CREATE INDEX idx_members_workspace_id_active
  ON members (workspace_id)
  WHERE deleted_at IS NULL;

-- projects: always queried by workspace
CREATE INDEX idx_projects_workspace_id_active
  ON projects (workspace_id)
  WHERE deleted_at IS NULL;

-- notifications: will be queried by user frequently (Brick 14)
CREATE INDEX idx_notifications_user_id
  ON notifications (user_id)
  WHERE status = 'UNREAD';
