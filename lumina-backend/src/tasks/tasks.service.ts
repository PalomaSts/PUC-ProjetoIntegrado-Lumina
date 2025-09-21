import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Task } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: Prisma.TaskUncheckedCreateInput,
  ): Promise<Task> {
    data.dueDate = new Date(data.dueDate);
    data.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    return this.prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string, filters: any = {}) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    });
  }

  async findOne(userId: string, id: string): Promise<Task> {
    return this.prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: Prisma.TaskUncheckedUpdateInput,
  ): Promise<Task> {
    const {
      userId: _userId,
      id: _id,
      createdAt: _createdAt,
      projectId,
      ...allowedData
    } = data;

    await this.prisma.task.update({
      where: { id },
      data: {
        ...allowedData,
        ...(typeof projectId === 'string'
          ? { project: { connect: { id: projectId } } }
          : {}),
      },
    });
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.prisma.task.deleteMany({
      where: { id, userId },
    });
  }

  async assignToProject(userId: string, taskId: string, projectId: string) {
    return this.prisma.task.updateMany({
      where: {
        id: taskId,
        userId,
      },
      data: {
        projectId,
      },
    });
  }

  async findByProject(userId: string, projectId: string, done?: boolean) {
    const where: any = {
      userId,
      projectId,
    };

    if (done !== undefined) {
      where.done = done;
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
