import { Project } from '@devcollab/common/interfaces/project.interface';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'apps/api-gateway/src/infrastructure/database/database.service';
import { ProjectQueryDto } from './dto/project-query.dto';

type CreateProjectData = Omit<Project, 'id' | 'created_at' | 'updated_at'>;

type UpdateProjectData = Partial<
  Omit<
    Project,
    'id' | 'project_id' | 'created_by' | 'created_at' | 'updated_at'
  >
>;

@Injectable()
export class ProjectsRepository {
  constructor(private db: DatabaseService) {}

  async findByWorkspaceId(
    workspaceId: string,
    query: ProjectQueryDto,
  ): Promise<Project[]> {
    const sql = `
      SELECT id, name, slug, description, status, workspace_id, created_by, created_at, updated_at
      FROM projects
      WHERE workspace_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const offset = (query.page - 1) * query.limit;
    const result = await this.db.query<Project>(sql, [
      workspaceId,
      query.limit,
      offset,
    ]);
    return result.rows;
  }
  async countByWorkspaceId(workspaceId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) AS count
      FROM projects
      WHERE workspace_id = $1 AND deleted_at IS NULL
    `;
    const result = await this.db.query<{ count: string }>(sql, [workspaceId]);
    return parseInt(result.rows[0].count, 10);
  }
  async findById(projectId: string): Promise<Project | null> {
    const sql = `
      SELECT id, name, slug, description, status, workspace_id, created_by, created_at, updated_at
      FROM projects
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.db.query<Project>(sql, [projectId]);
    return result.rows[0] || null;
  }
  async create(data: CreateProjectData): Promise<Project> {
    const sql = `
      INSERT INTO projects (name, slug, description, status, workspace_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.db.query<Project>(sql, [
      data.name,
      data.slug,
      data.description,
      data.status,
      data.workspace_id,
      data.created_by,
    ]);
    return result.rows[0];
  }
  async update(projectId: string, data: UpdateProjectData): Promise<Project> {
    const sql = `
      UPDATE projects
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          description = COALESCE($3, description),
          status = COALESCE($4, status)
      WHERE id = $5 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.db.query<Project>(sql, [
      data.name,
      data.slug,
      data.description,
      data.status,
      projectId,
    ]);
    return result.rows[0];
  }
  async softDelete(projectId: string): Promise<void> {
    const sql = `
      UPDATE projects
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await this.db.query(sql, [projectId]);
  }
}
