/**
 * listUsers(page, limit) — delegates to usersRepository.findAll(), wraps in offset paginated response shape.

getUser(userId) — fetch by id, throw NotFoundException if not found.

setPlatformAdmin(userId, value) — call usersRepository.togglePlatformAdmin(userId, value), throw NotFoundException if user not found, invalidate user:{userId} cache, return updated user.

deleteUser(userId, requestingUser) — prevent self-deletion (throw BadRequestException), soft delete, invalidate cache, revoke all refresh tokens.
 */

import { OffsetPaginatedResponse } from '@devcollab/common/interfaces/pagination.interface';
import { User } from '@devcollab/common/interfaces/user.interface';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../../capabilities/cache/cache.service';
import { UsersRepository } from '../users/users.repository';
import { AdminQueryDto } from './dto/admin-query.dto';

@Injectable()
export class AdminServices {
  constructor(
    private usersRepository: UsersRepository,
    private cacheService: CacheService,
  ) {}
  async listUsers(
    query: AdminQueryDto,
  ): Promise<OffsetPaginatedResponse<User>> {
    const { users, total } = await this.usersRepository.findAll(
      query.page,
      query.limit,
    );
    const totalPages = Math.ceil(total / query.limit);
    return {
      data: users,
      pagination: {
        currentPage: query.page,
        perPage: query.limit,
        totalPages,
        totalItems: total,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }
  async getUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not Found');
    return user;
  }
  async setPlatformAdmin(userId: string, value: boolean) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not Found');
    return await this.usersRepository.togglePlatformAdmin(userId, value);
  }
  async deleteUser(userId: string, requestingUser: User) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not Found');
    if (requestingUser.id == userId)
      throw new BadRequestException('Cannot delete your account');
    await this.usersRepository.softDelete(userId);
    await this.usersRepository.revokeAllRefreshToken(userId);
    await this.cacheService.del(`user:${userId}`);
  }
}
