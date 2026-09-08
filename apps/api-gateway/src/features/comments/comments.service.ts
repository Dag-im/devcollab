import { CommentWithAuthor } from '@devcollab/common/interfaces/comment.interface';
import { Member } from '@devcollab/common/interfaces/member.interface';
import { CursorPaginatedResponse } from '@devcollab/common/interfaces/pagination.interface';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}
  async create(
    dto: CreateCommentDto,
    taskId: string,
    member: Member,
  ): Promise<Comment> {
    return this.commentsRepository.create({
      body: dto.body,
      taskId,
      authorId: member.id,
    });
  }
  async findAll(
    taskId: string,
    query: CommentQueryDto,
  ): Promise<CursorPaginatedResponse<CommentWithAuthor>> {
    const comments = await this.commentsRepository.findByTaskId(taskId, query);
    const hasNextPage = comments.length > (query.limit ?? 50);
    const limitedComments = hasNextPage
      ? comments.slice(0, query.limit)
      : comments;
    return {
      data: limitedComments,
      pagination: {
        limit: query.limit ?? 50,
        nextCursor: hasNextPage
          ? {
              date: limitedComments[
                limitedComments.length - 1
              ].created_at.toISOString(),
              id: limitedComments[limitedComments.length - 1].id,
            }
          : null,
        hasNextPage,
      },
    };
  }
  async findOne(commentId: string): Promise<CommentWithAuthor> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    commentId: string,
    dto: UpdateCommentDto,
    member: Member,
  ): Promise<Comment> {
    const updated = await this.commentsRepository.updateIfAuthor(
      commentId,
      dto.body,
      member.id,
    );
    if (!updated) {
      const exists = await this.commentsRepository.findById(commentId);
      throw exists
        ? new ForbiddenException('Only the author can edit this comment')
        : new NotFoundException('Comment not found');
    }
    return updated;
  }
  async delete(commentId: string, member: Member): Promise<void> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const isAuthor = comment.author_id === member.id;
    const isPrivileged = member.role === 'OWNER' || member.role === 'ADMIN';

    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenException(
        'Insufficient permissions to delete this comment',
      );
    }

    await this.commentsRepository.softDelete(commentId);
  }
}
