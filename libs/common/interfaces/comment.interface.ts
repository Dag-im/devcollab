export interface Comment {
  id: string;
  body: string;
  task_id: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommentWithAuthor extends Comment {
  author_username: string | null;
  author_avatar_url: string | null;
  author_role: string;
}
