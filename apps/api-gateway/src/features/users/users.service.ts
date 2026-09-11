import { User } from '@devcollab/common/interfaces/user.interface';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  /**
   * getProfile(userId) — fetch user by id, throw NotFoundException if not found, return user object.

updateProfile(userId, dto) — dynamic update of username and/or avatar_url, invalidate user:{userId} cache after, return updated user.

changePassword(userId, dto) — fetch user with password hash, bcrypt.compare current password, throw UnauthorizedException if wrong, hash new password, update, revoke all refresh tokens, invalidate cache. Return nothing.

deleteAccount(userId) — soft delete the user row, revoke all refresh tokens, invalidate user:{userId} cache. Return nothing
   *
   */
  async getProfile(userId): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId, dto: updateProfileDto) {
    const existing = await this.usersRepository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');
    const isAuthorised = await
    const user = await this.usersRepository.updateUser(userId, dto);
    return user;
  }
  async changePassword(userId, dto: changePasswordDto) {
    const existing = await this.usersRepository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');
    const isAuthorised = bcrypt.compare(dto.existingPassword, existing.password)
    if(!isAuthorised) throw new UnauthorizedException('Wrong current password')
    const user = await this.usersRepository.changePassword(userId, dto);
    return user;
  }
}
