import { CommentWithAuthor } from '@devcollab/common/interfaces/comment.interface';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { CommentQueryDto } from './dto/comment-query.dto';

@Injectable()
export class CommentsRepository {
  constructor(private db: DatabaseService) {}
  async findByTaskId(
    taskId: string,
    query: CommentQueryDto,
  ): Promise<CommentWithAuthor[]> {
    let conditions: string[] = ['c.task_id = $1', 'c.deleted_at IS NULL'];
    const values: any[] = [taskId];
    let idx = 2;

    if (query.cursorDate && query.cursorId) {
      conditions.push(
        `(c.created_at < $${idx} OR (c.created_at = $${idx} AND c.id < $${idx + 1}))`,
      );
      values.push(new Date(query.cursorDate));
      idx++;
      values.push(query.cursorId);
      idx++;
    }

    const sql = `
  SELECT
  c.id, c.body, c.task_id, c.author_id, c.created_at, c.updated_at,
  u.username as author_username,
  u.avatar_url as author_avatar_url,
  m.role as author_role
FROM comments c
INNER JOIN members m ON m.id = c.author_id
LEFT JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
WHERE ${conditions.join(' AND ')}
  ORDER BY t.created_at ASC, t.id ASC
  LIMIT $${idx}
`;
    const result = await this.db.query<CommentWithAuthor>(sql, values);
    return result.rows;
  }
  async findById(commentId: string): Promise<CommentWithAuthor | null> {
    const sql = `
    SELECT
  c.id, c.body, c.task_id, c.author_id, c.created_at, c.updated_at,
  u.username as author_username,
  u.avatar_url as author_avatar_url,
  m.role as author_role
FROM comments c
INNER JOIN members m ON m.id = c.author_id
LEFT JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
WHERE c.id = $1 AND c.deletedAt IS NULL`;

    const result = await this.db.query<CommentWithAuthor>(sql, [commentId]);
    return result.rows[0] ?? null;
  }
  async create(data: {
    body: string;
    taskId: string;
    authorId: string;
  }): Promise<Comment> {
    const sql = `INSERT INTO comments(body, task_id ,author_id) VALUES ($1, $2, $3)`;
    const values = [data.body, data.taskId, data.authorId];
    const result = await this.db.query(sql, values);
    return result.rows[0];
  }
  async updateIfAuthor(
    commentId: string,
    body: string,
    authorId: string,
  ): Promise<Comment | null> {
    const result = await this.db.query<Comment>(
      `UPDATE comments
     SET body = $1, updated_at = NOW()
     WHERE id = $2 AND author_id = $3 AND deleted_at IS NULL
     RETURNING id, body, task_id, author_id, created_at, updated_at`,
      [body, commentId, authorId],
    );
    return result.rows[0] ?? null;
  }
  async softDelete(commentId: string): Promise<void> {
    const sql = `
    UPDATE comments
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
  `;
    return this.db.query(sql, [commentId]);
  }
}
