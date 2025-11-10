import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as appInsights from 'applicationinsights';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(ProjectsService.name);

  async create(project: Project): Promise<Project> {
    const { id, ...sanitized } = project;
    const result = this.prisma.project.create({
      data: { ...sanitized, status: sanitized.status || 'new' },
    });
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackTrace({
        message: 'Project created with server-side properties',
        properties: {
          context: 'ProjectService',
          action: 'create',
          userId: (await result).userId,
          projectId: id,
        },
      });
    }
    this.logger.log('Project created', 'ProjectsService');
    return result;
  }

  async find(userId: string, id: string): Promise<Project> {
    const result = await this.prisma.project.findUnique({ where: { id, userId } });

    if (!result) {
      throw new NotFoundException('Projeto não encontrado ou acesso negado');
    }

    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackTrace({
        message: 'Project found with server-side properties',
        properties: {
          context: 'ProjectService',
          action: 'find',
          userId: result.userId,
          projectId: result.id,
        },
      });
    }
    this.logger.log('Project found', 'ProjectsService');
    return result;
  }

  async findAll(userId: string): Promise<Project[]> {
    const result = this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackTrace({
        message: 'All projects found with server-side properties',
        properties: {
          context: 'ProjectService',
          action: 'findAll',
          userId: userId,
        },
      });
    }
    this.logger.log('All projects found', 'ProjectsService');
    return result;
  }

  async update(
    userId: string,
    id: string,
    name: string,
    status: string,
    description: string,
  ): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Projeto não encontrado ou acesso negado');
    }

    const currentStatus = project.status;

    const transitions = {
      new: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'paused', 'cancelled'],
      paused: ['in_progress'],
      completed: ['in_progress'],
      cancelled: [],
    };

    if (status !== currentStatus && !transitions[currentStatus].includes(status)) {
      throw new Error(`Transição inválida de status de '${currentStatus}' para '${status}'`);
    }

    const result = this.prisma.project.update({
      where: { id },
      data: { name, status, description },
    });

    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackTrace({
        message: 'Project updated with server-side properties',
        properties: {
          context: 'ProjectService',
          action: 'update',
          user: userId,
          projectId: id,
        },
      });
    }
    this.logger.log('Project updated', 'ProjectsService');
    return result;
  }

  async remove(userId: string, id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id, userId } });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado ou acesso negado');
    }

    await this.prisma.project.delete({
      where: { id },
    });
  }

  async findAllWithTasks(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}
