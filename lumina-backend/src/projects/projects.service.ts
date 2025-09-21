import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(project: Project): Promise<Project> {
    const { id, ...sanitized } = project;
    return this.prisma.project.create({
      data: { ...sanitized, status: sanitized.status || 'new' },
    });
  }

  async find(id: string): Promise<Project> {
    return this.prisma.project.findUnique({ where: { id } });
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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
      throw new Error('Projeto não encontrado ou acesso negado');
    }

    const currentStatus = project.status;

    const transitions = {
      new: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'paused', 'cancelled'],
      paused: ['in_progress'],
      completed: ['in_progress'],
      cancelled: [],
    };

    if (
      status !== currentStatus &&
      !transitions[currentStatus].includes(status)
    ) {
      throw new Error(
        `Transição inválida de status de '${currentStatus}' para '${status}'`,
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: { name, status, description },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project || project.userId !== userId) {
      throw new Error('Projeto não encontrado ou acesso negado');
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
