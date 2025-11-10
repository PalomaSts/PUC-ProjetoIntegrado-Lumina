import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { Prisma } from '@prisma/client';

@UseGuards(SessionAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Req() req: any, @Body() data: Prisma.TaskUncheckedCreateInput) {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // validação rápida opcional
    if (!data || !data.title) {
      throw new BadRequestException('Dados inválidos para criação de task');
    }

    return this.tasksService.create(userId, data);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    console.log('=== list tasks request ===', {
      cookies: req.cookies,
      session: req.session
        ? { hasUser: Boolean(req.session.user), userId: req.session?.user?.id }
        : null,
      filters: { projectId, status, priority },
    });

    const userId = req.session?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return this.tasksService.findAll(userId, {
      projectId,
      status,
      priority,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.tasksService.findOne(req.session.user.id, id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.TaskUncheckedUpdateInput, @Req() req) {
    return this.tasksService.update(req.session.user.id, id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.tasksService.remove(req.session.user.id, id);
  }

  @Patch(':id/assign-project/:projectId')
  async assignProject(
    @Param('id') taskId: string,
    @Param('projectId') projectId: string,
    @Req() req,
  ) {
    return this.tasksService.assignToProject(req.session.user.id, taskId, projectId);
  }

  @Get('/project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Req() req,
    @Query('done') done: string,
  ) {
    const doneFilter = done === 'true' ? true : done === 'false' ? false : undefined;

    return this.tasksService.findByProject(req.session.user.id, projectId, doneFilter);
  }

  @Get('stats/last24h')
  async getLast24h(@Req() req) {
    const userId = req.session?.user?.id;
    if (!userId) throw new UnauthorizedException('Usuário não autenticado');
    return this.tasksService.countTasksLast24h(userId);
  }

  @Get('stats/completion')
  async getCompletion(@Req() req) {
    const userId = req.session?.user?.id;
    if (!userId) throw new UnauthorizedException('Usuário não autenticado');
    return this.tasksService.getCompletionStats(userId);
  }
}
