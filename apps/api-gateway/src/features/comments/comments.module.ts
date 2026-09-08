import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/users.repository';
import { MemberRepository } from '../workspace/member.repository';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';

@Module({
  imports: [AuthModule],
  providers: [
    CommentsService,
    CommentsRepository,
    UsersRepository,
    MemberRepository,
  ],
  controllers: [CommentsController],
})
export class CommentsModule {}
