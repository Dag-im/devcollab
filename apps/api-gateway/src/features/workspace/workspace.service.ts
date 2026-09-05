import {
  Member,
  MemberRole,
  MemberWithUser,
} from '@devcollab/common/interfaces/member.interface';
import {
  Workspace,
  WorkspaceWithRole,
} from '@devcollab/common/interfaces/workspace.interface';
import { generateSlug, generateUniqueSlug } from '@devcollab/common/utils/slug';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CacheService } from '../../capabilities/cache/cache.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { UsersRepository } from '../users/users.repository';
import { CreateWorkspaceDto } from './dto/create-workspace';
import { InviteMemberDto } from './dto/invite-member';
import { UpdateMemberRoleDto } from './dto/update-member-role';
import { UpdateWorkspaceDto } from './dto/update-workspace';
import { MemberRepository } from './member.repository';
import { WorkspaceRepository } from './workspace.repository';

@Injectable()
export class WorkspaceService {
  constructor(
    private db: DatabaseService,
    private workspaceRepository: WorkspaceRepository,
    private memberRepository: MemberRepository,
    private cacheService: CacheService,
    private usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateWorkspaceDto, userId: string): Promise<Workspace> {
    const slug = generateSlug(dto.name);
    try {
      return await this.db.transaction(async (client) => {
        const workspace = await this.workspaceRepository.create(
          {
            name: dto.name,
            slug: slug,
            description: dto.description ?? null,
            ownerId: userId,
          },
          client,
        );
        await this.memberRepository.create(
          {
            userId,
            workspaceId: workspace.id,
            role: 'OWNER',
          },
          client,
        );
        return workspace;
      });
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique violation, retry with a unique slug
        const uniqueSlug = generateUniqueSlug(dto.name);
        return await this.db.transaction(async (client) => {
          const workspace = await this.workspaceRepository.create(
            {
              name: dto.name,
              slug: uniqueSlug,
              description: dto.description ?? null,
              ownerId: userId,
            },
            client,
          );
          await this.memberRepository.create(
            {
              userId,
              workspaceId: workspace.id,
              role: 'OWNER',
            },
            client,
          );
          return workspace;
        });
      }

      throw error;
    }
  }
  async findAll(userId: string): Promise<WorkspaceWithRole[]> {
    return this.workspaceRepository.findAllByUserId(userId);
  }
  async findOne(workspaceId: string): Promise<Workspace> {
    const cacheKey = `workspace:${workspaceId}`;
    let workspace = await this.cacheService.get<Workspace>(cacheKey);
    if (!workspace) {
      workspace = await this.workspaceRepository.findById(workspaceId);
      if (!workspace) throw new NotFoundException('Workspace not found');
      await this.cacheService.set(cacheKey, workspace, 300); // 5 min TTL
    }
    return workspace;
  }
  async update(
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const updatedWorkspace = await this.workspaceRepository.update(
      workspaceId,
      dto,
    );
    await this.cacheService.del(`workspace:${workspaceId}`);
    return updatedWorkspace;
  }
  async delete(workspaceId: string, member: Member): Promise<void> {
    await this.db.transaction(async (client) => {
      await this.workspaceRepository.softDelete(workspaceId);
      await this.memberRepository.softDelete(member.id);
    });
    await this.cacheService.del(`workspace:${workspaceId}`);
    await this.cacheService.delByPattern(`member:*:${workspaceId}`);
  }
  async leave(workspaceId: string, member: Member): Promise<void> {
    await this.memberRepository.softDelete(member.id);
    await this.cacheService.del(`member:${member.user_id}:${workspaceId}`);
  }
  async getMembers(workspaceId: string): Promise<MemberWithUser[]> {
    const cacheKey = `workspace:${workspaceId}:members`;
    let members = await this.cacheService.get<MemberWithUser[]>(cacheKey);
    if (!members) {
      members = await this.memberRepository.findByWorkspaceId(workspaceId);
      await this.cacheService.set(cacheKey, members, 300); // 5 min TTL
    }
    return members;
  }
  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    actingMember: Member,
  ): Promise<Member> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('No user with that email');
    }
    const existingMember = await this.memberRepository.findByUserAndWorkspace(
      user.id,
      workspaceId,
    );
    if (existingMember) {
      throw new ConflictException('User is already a member');
    }
    const newMember = await this.memberRepository.create({
      userId: user.id,
      workspaceId,
      role: dto.role ?? MemberRole.MEMBER,
    });
    await this.cacheService.del(`workspace:${workspaceId}:members`);
    return newMember;
  }
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    actingMember: Member,
  ): Promise<Member> {
    const targetMember = await this.memberRepository.findById(memberId);
    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }
    if (targetMember.user_id === actingMember.user_id) {
      throw new BadRequestException('Cannot change your own role');
    }
    const updatedMember = await this.memberRepository.updateRole(
      memberId,
      dto.role,
    );
    await this.cacheService.del(
      `member:${targetMember.user_id}:${workspaceId}`,
    );
    await this.cacheService.del(`workspace:${workspaceId}:members`);
    return updatedMember;
  }
  async removeMember(
    workspaceId: string,
    memberId: string,
    actingMember: Member,
  ): Promise<void> {
    const targetMember = await this.memberRepository.findById(memberId);
    if (!targetMember) {
      throw new NotFoundException('Member not found');
    }
    if (targetMember.user_id === actingMember.user_id) {
      throw new BadRequestException('Cannot remove yourself');
    }
    await this.memberRepository.softDelete(memberId);
    await this.cacheService.del(
      `member:${targetMember.user_id}:${workspaceId}`,
    );
    await this.cacheService.del(`workspace:${workspaceId}:members`);
  }
}
