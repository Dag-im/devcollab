import { User } from '@devcollab/common/interfaces/user.interface';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../../capabilities/cache/cache.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private cacheService: CacheService,
  ) {}
  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.usersRepository.findById(userId);
    if (!existing) throw new NotFoundException('User not found');
    const user = await this.usersRepository.updateProfile(userId, dto);
    await this.cacheService.del(`user:${userId}`);
    return user;
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundException('User not found');
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');
    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepository.updatePassword(userId, newHash);
    await this.usersRepository.revokeAllRefreshToken(userId);
    await this.cacheService.del(`user:${userId}`);
  }
  async deleteAccount(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepository.softDelete(userId);
    await this.usersRepository.revokeAllRefreshToken(userId);
    await this.cacheService.del(`user:${userId}`);
  }
}
