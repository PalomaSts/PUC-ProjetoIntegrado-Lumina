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
  UnauthorizedException,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ProjectsService } from './projects.service';

@UseGuards(SessionAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(201)
  async create(@Req() req: any): Promise<Project> {
    console.log('=== create project request ===', {
      cookies: req.cookies,
      session: req.session
        ? { hasUser: Boolean(req.session.user), userId: req.session?.user?.id }
        : null,
      bodyPreview: { name: req.body?.name },
    });

    const userId = req.session?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const newProject = req.body as Project;
    if (!newProject || !newProject.name) {
      throw new BadRequestException('Dados inválidos para criação de projeto');
    }

    // garante que o projeto seja sempre criado ligado ao usuário da sessão
    newProject.userId = userId;

    return await this.projectsService.create(newProject);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.session?.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  async find(@Param('id') id: string, @Req() req) {
    return this.projectsService.find(req.session.user.id, id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('status') status: string,
    @Body('description') description: string,
    @Req() req,
  ) {
    return this.projectsService.update(req.session.user.id, id, name, status, description);
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
