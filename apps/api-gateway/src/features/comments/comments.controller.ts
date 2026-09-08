import { Member } from '@devcollab/common/interfaces/member.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentMember } from '../auth/decorators/current-member';
import { CommentsService } from './comments.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller(
  'workspaces/:workspaceId/projects/:projectId/tasks/:taskId/comments',
)
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}
  @Get()
  findAll(@Param('taskId') taskId: string, @Query() query: CommentQueryDto) {
    return this.commentsService.findAll(taskId, query);
  }

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentMember() member: Member,
  ) {
    return this.commentsService.create(dto, taskId, member);
  }

  @Patch(':commentId')
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentMember() member: Member,
  ) {
    return this.commentsService.update(commentId, dto, member);
  }

  @Delete(':commentId')
  @HttpCode(204)
  delete(
    @Param('commentId') commentId: string,
    @CurrentMember() member: Member,
  ) {
    return this.commentsService.delete(commentId, member);
  }
}
