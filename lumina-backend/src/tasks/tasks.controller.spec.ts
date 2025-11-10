import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {};
const mockAuthService = {};
const mockSessionAuthGuard = { canActivate: () => true };

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue(mockSessionAuthGuard)
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
