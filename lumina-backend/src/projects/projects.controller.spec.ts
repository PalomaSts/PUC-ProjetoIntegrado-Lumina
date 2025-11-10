import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { AuthService } from '../auth/auth.service';

const mockPrismaService = {};
const mockAuthService = {};
const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },

        { provide: PrismaService, useValue: mockPrismaService },

        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
