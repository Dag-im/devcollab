import { RefreshToken } from '@devcollab/common/interfaces/refreshToken.interface';
import { User } from '@devcollab/common/interfaces/user.interface';
import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersRepository {
  constructor(private db: DatabaseService) {}
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.query(
      `SELECT id, email, username, avatar_url, is_verified,is_platform_admin, created_at
   FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return user.rows[0];
  }
  async findByEmailWithPassword(
    email: string,
  ): Promise<(User & { password_hash: string }) | null> {
    const result = await this.db.query<User & { password_hash: string }>(
      `SELECT id, email, username, avatar_url, is_verified,is_platform_admin, created_at, password_hash
     FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async findByIdWithPassword(
    id: string,
  ): Promise<(User & { password_hash: string }) | null> {
    const result = await this.db.query<User & { password_hash: string }>(
      `SELECT id, email, username, avatar_url, is_verified,is_platform_admin, created_at, password_hash
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.query(
      `SELECT id, email, username, avatar_url, is_verified,is_platform_admin, created_at
   FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return user.rows[0];
  }
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const [usersResult, countResult] = await Promise.all([
      this.db.query<User>(
        `SELECT id, email, username, avatar_url, is_verified, is_platform_admin, created_at
       FROM users WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`,
      ),
    ]);
    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<User> {
    try {
      const result = await this.db.query<User>(
        `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, avatar_url, is_verified, is_platform_admin, created_at`,
        [data.email, data.username, data.passwordHash],
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505')
        throw new ConflictException('Email or username already in use');
      throw error;
    }
  }

  async togglePlatformAdmin(
    userId: string,
    value: boolean,
  ): Promise<User | null> {
    const result = await this.db.query<User>(
      `UPDATE users
     SET is_platform_admin = $1
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING id, email, username, avatar_url, is_verified, is_platform_admin, created_at`,
      [value, userId],
    );
    return result.rows[0] ?? null;
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
    const result = await this.db.query<User>(
      `UPDATE users
     SET username = COALESCE($1, username),
         avatar_url = COALESCE($2, avatar_url)
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING id, email, username, avatar_url, is_verified, is_platform_admin, created_at`,
      [data.username, data.avatar_url, userId],
    );
    return result.rows[0];
  }
  async updatePassword(userId, passwordHash) {
    const result = await this.db.query<User>(
      `UPDATE users
    SET password_hash = $1
    WHERE id = $2 AND deleted_at is NULL
    RETURNING id, email, username, avatar_url, is_verified, is_platform_admin, created_at`,
      [passwordHash, userId],
    );
    return result.rows[0] ?? null;
  }

  async softDelete(userId: string): Promise<void> {
    const sql = `
      UPDATE users
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await this.db.query(sql, [userId]);
  }

  // store a new refresh token
  async createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    return await this.db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [data.userId, data.tokenHash, data.expiresAt],
    );
  }

  // find a valid (non-revoked, non-expired) token by hash
  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const result = await this.db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [tokenHash],
    );
    return result.rows[0] || null;
  }

  // revoke a specific token
  async revokeRefreshToken(tokenHash: string): Promise<void> {
    const result = await this.db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1',
      [tokenHash],
    );
    return result.rows[0];
  }
  async revokeAllRefreshToken(userId) {
    const sql = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`;
    await this.db.query(sql, [userId]);
  }
}
