-- Drop the full unique constraint
ALTER TABLE members
DROP CONSTRAINT uq_members_user_workspace;

-- Replace with partial unique index — only active memberships must be unique
CREATE UNIQUE INDEX uq_members_active
  ON members (user_id, workspace_id)
  WHERE deleted_at IS NULL;
