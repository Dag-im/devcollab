import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/users.repository';
import { MemberRepository } from '../workspace/member.repository';
import { AttachmentsController } from './attachment.controller';
import { AttachmentRepository } from './attachment.repository';
import { AttachmentService } from './attachment.service';

@Module({
  imports: [AuthModule],
  providers: [
    AttachmentService,
    AttachmentRepository,
    UsersRepository,
    MemberRepository,
  ],
  controllers: [AttachmentsController],
  exports: [AttachmentService],
})
export class AttachmentsModule {}
