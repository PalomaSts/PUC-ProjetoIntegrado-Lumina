import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const mockTask = { id: '1', title: 'Test Task', done: false };
      prisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create('user-id', 'Test Task', 'project-id');

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          userId: 'user-id',
          projectId: 'project-id',
        },
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const mockTasks = [{ id: '1', title: 'Test Task', done: false }];
      prisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll('user-id');

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: { project: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      prisma.task.findFirst.mockResolvedValue({
        id: '1',
        title: 'Test Task',
        done: false,
        userId: 'user-id',
        projectId: null,
        createdAt: new Date(),
      });

      prisma.task.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.update('user-id', '1', { done: true });

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' },
      });

      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' },
        data: { done: true },
      });

      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      prisma.task.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('user-id', '1');

      expect(prisma.task.deleteMany).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' }, // ✅ corrigido
      });
      expect(result).toBeUndefined();
    });
  });
});
