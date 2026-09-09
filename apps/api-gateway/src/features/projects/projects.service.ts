import { Member } from '@devcollab/common/interfaces/member.interface';
import { OffsetPaginatedResponse } from '@devcollab/common/interfaces/pagination.interface';
import {
  Project,
  ProjectStatus,
} from '@devcollab/common/interfaces/project.interface';
import { generateSlug } from '@devcollab/common/utils/slug';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}
  async create(
    dto: CreateProjectDto,
    workspaceId: string,
    member: Member,
  ): Promise<Project> {
    return this.projectsRepository.create({
      name: dto.name,
      slug: generateSlug(dto.name),
      description: dto.description ?? null,
      status: ProjectStatus.ACTIVE,
      workspace_id: workspaceId,
      created_by: member.id,
    });
  }
  async findAll(
    workspaceId: string,
    query: ProjectQueryDto,
  ): Promise<OffsetPaginatedResponse<Project>> {
    const { projects, total } = await this.projectsRepository.findByWorkspaceId(
      workspaceId,
      query,
    );
    const totalPages = Math.ceil(total / query.limit);
    return {
      data: projects,
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
  async findOne(projectId: string): Promise<Project> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
  async update(projectId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectsRepository.update(projectId, dto);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
  async delete(projectId: string): Promise<void> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.projectsRepository.softDelete(projectId);
  }
}
