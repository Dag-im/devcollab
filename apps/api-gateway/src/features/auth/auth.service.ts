import { hash } from '@devcollab/common/utils/hash';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CacheService } from '../../capabilities/cache/cache.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private cacheService: CacheService,
    private db: DatabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const newUser = await this.usersRepository.createUser({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });
    return newUser;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = crypto.randomUUID();
    const refreshTokenHash = hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.usersRepository.createRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isPlatformAdmin: user.is_platform_admin,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hash(refreshToken);

    return await this.db.transaction(async (client) => {
      // lock the row — second concurrent request waits here
      const tokenRecord = await this.usersRepository.findAndLockRefreshToken(
        tokenHash,
        client,
      );

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.usersRepository.findById(tokenRecord.user_id);
      if (!user) throw new UnauthorizedException();

      // revoke old token
      await this.usersRepository.revokeRefreshTokenByHash(tokenHash, client);

      // issue new token
      const newRefreshToken = crypto.randomUUID();
      const newHash = hash(newRefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.usersRepository.createRefreshToken(
        {
          userId: user.id,
          tokenHash: newHash,
          expiresAt,
        },
        client,
      );

      return {
        accessToken: this.jwtService.sign({ sub: user.id, email: user.email }),
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    });
    // TODO: add comment — Brick 10: SELECT FOR UPDATE closes replay race condition
  }
  async logout(refreshToken: string, userId: string) {
    const refreshTokenHash = hash(refreshToken);
    await this.usersRepository.revokeRefreshToken(refreshTokenHash);
    await this.cacheService.del(`user:${userId}`);
    return { message: 'Logged out successfully' };
  }
}
