import {
  Task,
  TaskWithAssignee,
} from '@devcollab/common/interfaces/task.interface';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/api-gateway/src/infrastructure/database/database.service';
import { TaskQueryDto } from './dto/task-query.dto';

type CreateTaskData = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

type UpdateTaskData = Partial<
  Omit<Task, 'id' | 'project_id' | 'created_by' | 'created_at' | 'updated_at'>
>;

@Injectable()
export class TasksRepository {
  constructor(private db: DatabaseService) {}
  async findByProjectId(
    projectId: string,
    query: TaskQueryDto,
  ): Promise<TaskWithAssignee[]> {
    const conditions: string[] = ['t.project_id = $1', 't.deleted_at IS NULL'];
    const values: any[] = [projectId];
    let idx = 2;

    if (query.cursorDate && query.cursorId) {
      conditions.push(
        `(t.created_at < $${idx} OR (t.created_at = $${idx} AND t.id < $${idx + 1}))`,
      );
      values.push(new Date(query.cursorDate));
      idx++;
      values.push(query.cursorId);
      idx++;
    }
    if (query.status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(query.status);
    }
    if (query.priority) {
      conditions.push(`t.priority = $${idx++}`);
      values.push(query.priority);
    }
    if (query.assigneeId) {
      conditions.push(`t.assignee_id = $${idx++}`);
      values.push(query.assigneeId);
    }

    // fetch limit + 1 to determine hasNextPage
    values.push((query.limit ?? 20) + 1);

    const sql = `
    SELECT
      t.id, t.title, t.description, t.status, t.priority,
      t.due_date, t.created_at, t.updated_at,
      t.created_by, t.assignee_id,
      m.id as assignee_member_id,
      u.username as assignee_username,
      u.avatar_url as assignee_avatar_url
    FROM tasks t
    LEFT JOIN members m ON m.id = t.assignee_id AND m.deleted_at IS NULL
    LEFT JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
    WHERE ${conditions.join(' AND ')}
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT $${idx}
  `;

    const result = await this.db.query<TaskWithAssignee>(sql, values);
    return result.rows;
  }

  async findById(taskId: string): Promise<TaskWithAssignee | null> {
    const sql = `
    SELECT
      t.id, t.title, t.description, t.status, t.priority,
      t.due_date, t.created_at, t.updated_at,
      t.created_by, t.assignee_id,
      m.id as assignee_member_id,
      u.username as assignee_username,
      u.avatar_url as assignee_avatar_url
    FROM tasks t
    LEFT JOIN members m ON m.id = t.assignee_id AND m.deleted_at IS NULL
    LEFT JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
    WHERE t.id = $1 AND t.deleted_at IS NULL
  `;

    const result = await this.db.query<TaskWithAssignee>(sql, [taskId]);
    return result.rows[0] ?? null;
  }
  async create(data: CreateTaskData): Promise<Task> {
    const sql = `
    INSERT INTO tasks (title, description, priority, status, project_id, assignee_id, created_by, due_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

    const values = [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.project_id,
      data.assignee_id,
      data.created_by,
      data.due_date,
    ];

    const result = await this.db.query<Task>(sql, values);
    return result.rows[0];
  }
  async update(taskId: string, data: UpdateTaskData): Promise<Task> {
    const sql = `
  UPDATE tasks
  SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    priority = COALESCE($3, priority),
    status = COALESCE($4, status),
    assignee_id = COALESCE($5, assignee_id),
    due_date = COALESCE($6, due_date)
  WHERE id = $7 AND deleted_at IS NULL
  RETURNING id, title, description, status, priority, project_id,
            assignee_id, created_by, due_date, created_at, updated_at
`;

    const values = [
      data.title,
      data.description,
      data.priority,
      data.status,
      data.assignee_id,
      data.due_date,
      taskId,
    ];

    const result = await this.db.query<Task>(sql, values);
    return result.rows[0];
  }
  async softDelete(taskId: string): Promise<void> {
    const sql = `
    UPDATE tasks
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
  `;

    await this.db.query(sql, [taskId]);
  }
}
