export interface RefreshToken {
  id: string;
  token_hash: string;
  user_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}
