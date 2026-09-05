import {
  Workspace,
  WorkspaceWithRole,
} from '@devcollab/common/interfaces/workspace.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../infrastructure/database/database.service';

type CreateWorkspaceData = {
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
};

type UpdateWorkspaceData = {
  name?: string;
  slug?: string;
  description?: string | null;
};

@Injectable()
export class WorkspaceRepository {
  constructor(private db: DatabaseService) {}
  async findAllByUserId(userId: string): Promise<WorkspaceWithRole[]> {
    const result = await this.db.query<WorkspaceWithRole>(
      `SELECT w.id, w.name, w.slug, w.description, w.owner_id, w.created_at, m.role
         FROM workspaces w
         INNER JOIN members m ON m.workspace_id = w.id
         WHERE m.user_id = $1
         AND w.deleted_at IS NULL
         AND m.deleted_at IS NULL;`,
      [userId],
    );
    return result.rows;
  }
  async findById(workspaceId: string): Promise<Workspace | null> {
    const result = await this.db.query<Workspace>(
      `SELECT id, name, slug, description, owner_id, created_at
         FROM workspaces
         WHERE id = $1
         AND deleted_at IS NULL;`,
      [workspaceId],
    );
    return result.rows[0] ?? null;
  }
  async create(
    data: CreateWorkspaceData,
    client?: PoolClient,
  ): Promise<Workspace> {
    const runner = client ?? (this.db as any).pool;
    const result = await runner.query(
      `INSERT INTO workspaces (name, slug, description, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, slug, description, owner_id, created_at`,
      [data.name, data.slug, data.description, data.ownerId],
    );
    return result.rows[0];
  }
  async update(
    workspaceId: string,
    data: UpdateWorkspaceData,
  ): Promise<Workspace> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }

    if (!fields.length) throw new BadRequestException('No fields to update');

    values.push(workspaceId);
    const result = await this.db.query<Workspace>(
      `UPDATE workspaces SET ${fields.join(', ')} WHERE id = $${idx}
     AND deleted_at IS NULL
     RETURNING id, name, slug, description, owner_id, created_at, updated_at`,
      values,
    );
    return result.rows[0];
  }
  async softDelete(workspaceId: string): Promise<void> {
    await this.db.query(
      `UPDATE workspaces
         SET deleted_at = NOW()
         WHERE id = $1;`,
      [workspaceId],
    );
  }
}
