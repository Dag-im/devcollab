import {
  Attachment,
  AttachmentWithUploader,
} from '@devcollab/common/interfaces/attachment.interface';
import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../infrastructure/database/database.service';

type CreateAttachmentData = {
  filename: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  taskId: string;
  uploadedBy: string;
};

@Injectable()
export class AttachmentRepository {
  constructor(private db: DatabaseService) {}

  async findByTaskId(taskId: string): Promise<AttachmentWithUploader[]> {
    const result = await this.db.query<AttachmentWithUploader>(
      `SELECT
        a.id, a.filename, a.file_key, a.file_size, a.mime_type,
        a.task_id, a.uploaded_by, a.created_at,
        u.username as uploader_username,
        u.avatar_url as uploader_avatar_url
       FROM attachments a
       INNER JOIN members m ON m.id = a.uploaded_by
       LEFT JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
       WHERE a.task_id = $1
       ORDER BY a.created_at ASC`,
      [taskId],
    );
    return result.rows;
  }

  async findById(attachmentId: string): Promise<Attachment | null> {
    const result = await this.db.query<Attachment>(
      `SELECT id, filename, file_key, file_size, mime_type, task_id, uploaded_by, created_at
       FROM attachments
       WHERE id = $1`,
      [attachmentId],
    );
    return result.rows[0] ?? null;
  }

  async create(
    data: CreateAttachmentData,
    client?: PoolClient,
  ): Promise<Attachment> {
    const runner = client ?? (this.db as any).pool;
    const result = await runner.query<Attachment>(
      `INSERT INTO attachments (filename, file_key, file_size, mime_type, task_id, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, file_key, file_size, mime_type, task_id, uploaded_by, created_at`,
      [
        data.filename,
        data.fileKey,
        data.fileSize,
        data.mimeType,
        data.taskId,
        data.uploadedBy,
      ],
    );
    return result.rows[0];
  }

  async hardDelete(attachmentId: string): Promise<Attachment | null> {
    const result = await this.db.query<Attachment>(
      `DELETE FROM attachments
       WHERE id = $1
       RETURNING id, filename, file_key, file_size, mime_type, task_id, uploaded_by, created_at`,
      [attachmentId],
    );
    return result.rows[0] ?? null;
  }

  async hardDeleteByTaskId(taskId: string): Promise<Attachment[]> {
    const result = await this.db.query<Attachment>(
      `DELETE FROM attachments
       WHERE task_id = $1
       RETURNING id, filename, file_key, file_size, mime_type, task_id, uploaded_by, created_at`,
      [taskId],
    );
    return result.rows;
  }
}
