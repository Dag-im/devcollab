import { Member } from '@devcollab/common/interfaces/member.interface';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CacheService } from '../../capabilities/cache/cache.service';
import { MemberRepository } from '../../features/workspace/member.repository';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private membersRepository: MemberRepository,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    if (!workspaceId) return true; // route doesn't need workspace context

    const cacheKey = `member:${user.id}:${workspaceId}`;
    let member = await this.cacheService.get<Member>(cacheKey);

    if (!member) {
      member = await this.membersRepository.findByUserAndWorkspace(
        user.id,
        workspaceId,
      );
      if (!member)
        throw new ForbiddenException('Not a member of this workspace');
      await this.cacheService.set(cacheKey, member, 300); // 5 min TTL
    }

    request.member = member;
    return true;
  }
}
