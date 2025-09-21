import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ProjectsService } from './projects.service';

@UseGuards(SessionAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Req() req) {
    const newProject = req.body as Project;
    try {
      newProject.userId = req.session.user.id;
      this.projectsService.create(newProject);
    } catch (error) {
      return {};
    }
  }

  @Get()
  async findAll(@Req() req) {
    return this.projectsService.findAll(req.session.user.id);
  }

  @Get(':id')
  async find(@Param('id') id: string, @Req() req) {
    return this.projectsService.find(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('status') status: string,
    @Body('description') description: string,
    @Req() req,
  ) {
    return this.projectsService.update(
      req.session.user.id,
      id,
      name,
      status,
      description,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    await this.projectsService.remove(req.session.user.id, id);
    return { message: 'Projeto deletado com sucesso' };
  }

  @Get('with-tasks')
  async findAllWithTasks(@Req() req) {
    return this.projectsService.findAllWithTasks(req.session.user.id);
  }
}
