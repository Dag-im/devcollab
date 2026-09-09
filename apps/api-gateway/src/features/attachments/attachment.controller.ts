import { Member } from '@devcollab/common/interfaces/member.interface';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { multerConfig } from '../../common/multer/multer.config';
import { CurrentMember } from '../auth/decorators/current-member';
import { AttachmentService } from './attachment.service';

@Controller(
  'workspaces/:workspaceId/projects/:projectId/tasks/:taskId/attachments',
)
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentService) {}

  @Get()
  findAll(@Param('taskId') taskId: string) {
    return this.attachmentsService.findAll(taskId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, multerConfig))
  upload(
    @Param('taskId') taskId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentMember() member: Member,
  ) {
    return this.attachmentsService.upload(files, taskId, member);
  }

  @Delete(':attachmentId')
  @HttpCode(204)
  delete(
    @Param('attachmentId') attachmentId: string,
    @CurrentMember() member: Member,
  ) {
    return this.attachmentsService.delete(attachmentId, member);
  }
}
