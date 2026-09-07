import { Member } from '@devcollab/common/interfaces/member.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { CurrentMember } from '../auth/decorators/current-member';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  create(
    @Body() dto: CreateProjectDto,
    @Param('workspaceId') workspaceId: string,
    @CurrentMember() member: Member,
  ) {
    return this.projectsService.create(dto, workspaceId, member);
  }
  @Get()
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Query() query: ProjectQueryDto,
  ) {
    return this.projectsService.findAll(workspaceId, query);
  }
  @Get(':projectId')
  findOne(@Param('projectId') id: string) {
    return this.projectsService.findOne(id);
  }
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch('projectId')
  update(@Param('projectId') id: string, dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }
  @Roles('OWNER', 'ADMIN')
  @UseGuards(RolesGuard)
  @Delete('projectId')
  delete(@Param('projectId') id: string) {
    return this.projectsService.delete(id);
  }
}
