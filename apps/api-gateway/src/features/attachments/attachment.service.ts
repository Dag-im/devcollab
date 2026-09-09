import {
    Attachment,
    AttachmentWithUploader,
} from '@devcollab/common/interfaces/attachment.interface';
import { Member } from '@devcollab/common/interfaces/member.interface';
import { validateFile } from '@devcollab/common/utils/file-validation.util';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { AttachmentRepository } from './attachment.repository';

@Injectable()
export class AttachmentService {
  constructor(
    private storageService: StorageService,
    private attachmentsRepository: AttachmentRepository,
    private db: DatabaseService,
  ) {}
  async upload(files: Express.Multer.File[], taskId: string, member: Member) {
    // 1. validate all files first — fail fast before touching storage
    for (const file of files) {
      const error = validateFile(file);
      if (error) throw new BadRequestException(error);
    }

    // 2. pre-generate keys so we can roll back on partial failure
    const uploads: Array<{
      file: Express.Multer.File;
      key: string;
      url: string;
    }> = [];

    // 3. attempt all uploads, track what succeeded
    const successful: string[] = []; // keys uploaded so far
    try {
      for (const file of files) {
        const { key, url } = await this.storageService.upload(
          file,
          `tasks/${taskId}`,
        );
        successful.push(key);
        uploads.push({ file, key, url });
      }
    } catch (uploadError) {
      // rollback all successful uploads
      await Promise.allSettled(
        successful.map((key) => this.storageService.deleteByKey(key)),
      );
      throw new InternalServerErrorException(
        'File upload failed — all uploads rolled back',
      );
    }

    // 4. all uploads succeeded — insert DB records in a transaction
    try {
      return await this.db.transaction(async (client) => {
        const results: Attachment[] = [];
        for (const { file, key } of uploads) {
          const attachment = await this.attachmentsRepository.create(
            {
              filename: file.originalname,
              fileKey: key,
              fileSize: file.size,
              mimeType: file.mimetype,
              taskId,
              uploadedBy: member.id,
            },
            client,
          );
          results.push(attachment);
        }
        return results;
      });
    } catch (dbError) {
      // DB failed — rollback all uploads
      await Promise.allSettled(
        uploads.map((u) => this.storageService.deleteByKey(u.key)),
      );
      throw new InternalServerErrorException(
        'Failed to save attachment records',
      );
    }
  }

  async findAll(taskId: string): Promise<AttachmentWithUploader[]> {
    const attachments = await this.attachmentsRepository.findByTaskId(taskId);

    // reconstruct full URL from stored key at read time
    return attachments.map((attachment) => ({
      ...attachment,
      file_url: this.storageService.getUrl(attachment.file_key),
    }));
  }

  async deleteByTaskId(taskId: string): Promise<void> {
    const deleted = await this.attachmentsRepository.hardDeleteByTaskId(taskId);
    await Promise.allSettled(
      deleted.map((a) => this.storageService.deleteByKey(a.file_key)),
    );
  }

  async delete(attachmentId: string, member: Member): Promise<void> {
    const attachment = await this.attachmentsRepository.findById(attachmentId);
    if (!attachment) throw new NotFoundException('Attachment not found');

    const isUploader = attachment.uploaded_by === member.id;
    const isPrivileged = member.role === 'OWNER' || member.role === 'ADMIN';
    if (!isUploader && !isPrivileged) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const deleted = await this.attachmentsRepository.hardDelete(attachmentId);
    if (deleted) await this.storageService.deleteByKey(deleted.file_key);
  }
}
