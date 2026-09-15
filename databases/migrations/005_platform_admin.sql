ALTER TABLE users
  ADD COLUMN is_platform_admin BOOLEAN NOT NULL DEFAULT false;

-- seed your own account as platform admin
UPDATE users
  SET is_platform_admin = true
  WHERE email = 'dagim@example.com';
