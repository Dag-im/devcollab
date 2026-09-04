CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE notification_type AS ENUM ('TASK_ASSIGNED', 'COMMENT_ADDED', 'MENTION', 'STATUS_CHANGED');
CREATE TYPE notification_status AS ENUM ('READ', 'UNREAD');
CREATE TYPE project_status AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');


CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  password_hash TEXT         NOT NULL,
  avatar_url    TEXT,
  is_verified   BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT uq_users_email    UNIQUE (email),
  CONSTRAINT uq_users_username UNIQUE (username)
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE workspaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id    UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT uq_workspaces_slug UNIQUE (slug)
);

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE members (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID      NOT NULL REFERENCES users(id),
  workspace_id UUID      NOT NULL REFERENCES workspaces(id),
  role         user_role NOT NULL DEFAULT 'MEMBER',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ,

  CONSTRAINT uq_members_user_workspace UNIQUE (user_id, workspace_id)
);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE notifications (
  id            UUID                NOT NULL DEFAULT gen_random_uuid(),
  type          notification_type   NOT NULL,
  message       TEXT                NOT NULL,
  status        notification_status NOT NULL DEFAULT 'UNREAD',

  -- targeting: one of these three, rest null = broadcast
  user_id       UUID REFERENCES users(id),
  role_target   user_role,

  -- polymorphic link to what triggered it
  entity_type   VARCHAR(50),  -- 'task', 'comment', 'project'
  entity_id     UUID,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE projects (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(255)   NOT NULL,
  slug         VARCHAR(100)   NOT NULL,
  description  TEXT,
  status       project_status NOT NULL DEFAULT 'ACTIVE',
  workspace_id UUID           NOT NULL REFERENCES workspaces(id),
  created_by   UUID           NOT NULL REFERENCES members(id),
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ    NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ,

  CONSTRAINT uq_projects_slug_workspace UNIQUE (slug, workspace_id)
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE tasks (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  status      task_status   NOT NULL DEFAULT 'TODO',
  priority    task_priority NOT NULL DEFAULT 'LOW',
  project_id  UUID          NOT NULL REFERENCES projects(id),
  assignee_id UUID          REFERENCES members(id),
  created_by  UUID          NOT NULL REFERENCES members(id),
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE comments (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  body       TEXT        NOT NULL,
  task_id    UUID        NOT NULL REFERENCES tasks(id),
  author_id  UUID        NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE attachments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    VARCHAR(255) NOT NULL,
  file_url    TEXT         NOT NULL,
  file_size   BIGINT       NOT NULL,
  mime_type   VARCHAR(100) NOT NULL,
  task_id     UUID         NOT NULL REFERENCES tasks(id),
  uploaded_by UUID         NOT NULL REFERENCES members(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);


CREATE TABLE refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES users(id),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash)
);
