export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_platform_admin: boolean; // ← add this
  created_at: Date;
}
