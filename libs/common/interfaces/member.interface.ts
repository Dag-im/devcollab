export interface Member {
  id: string;
  user_id: string;
  workspace_id: string;
  role: MemberRole;
  joined_at: Date;
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface MemberWithUser extends Member {
  username: string;
  email: string;
  avatar_url: string | null;
}
