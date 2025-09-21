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
  async create(@Req() req, @Body() data: Prisma.TaskUncheckedCreateInput) {
    return this.tasksService.create(req.session.user.id, data);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.tasksService.findAll(req.session.user.id, {
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
  async update(
    @Param('id') id: string,
    @Body() data: Prisma.TaskUncheckedUpdateInput,
    @Req() req,
  ) {
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
    return this.tasksService.assignToProject(
      req.session.user.id,
      taskId,
      projectId,
    );
  }

  @Get('/project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Req() req,
    @Query('done') done: string,
  ) {
    const doneFilter =
      done === 'true' ? true : done === 'false' ? false : undefined;

    return this.tasksService.findByProject(
      req.session.user.id,
      projectId,
      doneFilter,
    );
  }
}
