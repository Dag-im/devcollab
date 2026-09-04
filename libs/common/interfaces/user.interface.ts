export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: Date;
}
