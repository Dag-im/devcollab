import { Member } from '@devcollab/common/interfaces/member.interface';
import { User } from '@devcollab/common/interfaces/user.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentMember } from '../auth/decorators/current-member';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace';
import { InviteMemberDto } from './dto/invite-member';
import { UpdateMemberRoleDto } from './dto/update-member-role';
import { UpdateWorkspaceDto } from './dto/update-workspace';
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}
  @Post()
  create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: User) {
    return this.workspaceService.create(dto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.workspaceService.findAll(user.id);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceGuard)
  findOne(@Param('workspaceId') id: string) {
    return this.workspaceService.findOne(id);
  }

  @Patch(':workspaceId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  update(
    @Param('workspaceId') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @Req() req: Request,
  ) {
    return this.workspaceService.update(id, dto);
  }

  @Delete(':workspaceId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles('OWNER')
  @HttpCode(204)
  delete(@Param('workspaceId') id: string, @CurrentMember() member: Member) {
    return this.workspaceService.delete(id, member);
  }

  @Post(':workspaceId/leave')
  @UseGuards(WorkspaceGuard)
  @HttpCode(204)
  leave(@Param('workspaceId') id: string, @CurrentMember() member: Member) {
    return this.workspaceService.leave(id, member);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceGuard)
  getMembers(@Param('workspaceId') id: string) {
    return this.workspaceService.getMembers(id);
  }

  @Post(':workspaceId/members')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  inviteMember(
    @Param('workspaceId') id: string,
    @Body() dto: InviteMemberDto,
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.inviteMember(id, dto, member);
  }

  @Patch(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles('OWNER')
  updateMemberRole(
    @Param('workspaceId') wId: string,
    @Param('memberId') mId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.updateMemberRole(wId, mId, dto, member);
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @HttpCode(204)
  removeMember(
    @Param('workspaceId') wId: string,
    @Param('memberId') mId: string,
    @CurrentMember() member: Member,
  ) {
    return this.workspaceService.removeMember(wId, mId, member);
  }
}
