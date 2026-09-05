import { hash } from '@devcollab/common/utils/hash';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CacheService } from '../../capabilities/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private cacheService: CacheService,
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
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    };
  }

  async refresh(refreshToken: string) {
    const refreshTokenHash = hash(refreshToken);
    const tokenRecord =
      await this.usersRepository.findRefreshToken(refreshTokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findById(tokenRecord.user_id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.usersRepository.revokeRefreshToken(refreshTokenHash);

    const newRefreshToken = crypto.randomUUID();
    const newRefreshTokenHash = hash(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.usersRepository.createRefreshToken({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt,
    });

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
      refreshToken: newRefreshToken,
      expiresIn: 900,
    };
  }
  async logout(refreshToken: string, userId: string) {
    const refreshTokenHash = hash(refreshToken);
    await this.usersRepository.revokeRefreshToken(refreshTokenHash);
    await this.cacheService.del(`user:${userId}`);
    return { message: 'Logged out successfully' };
  }
}
