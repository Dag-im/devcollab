import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from 'apps/api-gateway/src/capabilities/cache/cache.service';
import { UsersRepository } from '../../features/users/users.repository';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const cacheKey = `user:${payload.sub}`;

      let user = await this.cacheService.get(cacheKey);

      // check user still exists and isn't deleted
      if (!user) {
        user = await this.usersRepository.findById(payload.sub);
        if (!user) throw new UnauthorizedException();

        // cache the user for future requests
        await this.cacheService.set(cacheKey, user, 60 * 15); // cache for 15 minutes
      }

      // attach to request so handlers can access it
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
