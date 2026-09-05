import {
  Member,
  MemberWithUser,
} from '@devcollab/common/interfaces/member.interface';
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../infrastructure/database/database.service';

type CreateMemberData = {
  userId: string;
  workspaceId: string;
  role: string;
};

@Injectable()
export class MemberRepository {
  constructor(private readonly db: DatabaseService) {}
  async findByWorkspaceId(workspaceId: string): Promise<MemberWithUser[]> {
    const result = await this.db.query<MemberWithUser>(
      `SELECT m.id, m.user_id, m.workspace_id, m.role, m.joined_at,
         u.username, u.email, u.avatar_url
         FROM members m
         INNER JOIN users u ON u.id = m.user_id
         WHERE m.workspace_id = $1
         AND m.deleted_at IS NULL
         AND u.deleted_at IS NULL`,
      [workspaceId],
    );
    return result.rows;
  }
  async findByUserAndWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<Member | null> {
    const result = await this.db.query<Member>(
      `SELECT id, user_id, workspace_id, role
         FROM members
         WHERE user_id = $1
         AND workspace_id = $2
         AND deleted_at IS NULL;`,
      [userId, workspaceId],
    );
    return result.rows[0] ?? null;
  }
  async findById(memberId: string): Promise<Member | null> {
    const result = await this.db.query<Member>(
      `SELECT id, user_id, workspace_id, role
         FROM members
         WHERE id = $1
         AND deleted_at IS NULL;`,
      [memberId],
    );
    return result.rows[0] ?? null;
  }
  async create(data: CreateMemberData, client?: PoolClient): Promise<Member> {
    const runner = client ?? this.db['pool'];
    const result = await runner.query<Member>(
      `INSERT INTO members (user_id, workspace_id, role)
         VALUES ($1, $2, $3)
         RETURNING *;`,
      [data.userId, data.workspaceId, data.role],
    );
    return result.rows[0];
  }
  async updateRole(memberId: string, role: string): Promise<Member> {
    const result = await this.db.query<Member>(
      `UPDATE members
         SET role = $1
         WHERE id = $2
         RETURNING *;`,
      [role, memberId],
    );
    return result.rows[0];
  }
  async softDelete(memberId: string): Promise<void> {
    await this.db.query(
      `UPDATE members
         SET deleted_at = NOW()
         WHERE id = $1;`,
      [memberId],
    );
  }
}
