import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  project: {
    findUnique: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: mockPrismaService }],
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
      const mockTask = {
        id: '1',
        title: 'Test Task',
        description: '',
        status: 'new',
        priority: 'medium',
        createdAt: new Date(),
        dueDate: new Date(),
        userId: 'test-user-id',
        projectId: null,
        done: false,
      };
      prisma.task.create.mockResolvedValue(mockTask);

      const payload: any = {
        title: 'Test Task',
        description: '',
        status: 'new',
        priority: 'medium',
        createdAt: new Date(),
        dueDate: new Date(),
      };

      const result = await service.create('test-user-id', payload);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          userId: 'test-user-id',
        },
      });

      expect(result).toEqual(mockTask);
      expect(result.title).toBe('Test Task');
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const mockTasks: any[] = [{ id: '1', title: 'Test Task', done: false }];
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
      const updatedTask = {
        id: '1',
        title: 'Updated Task',
        done: true,
        userId: 'user-id',
        projectId: null,
        createdAt: new Date(),
      };

      prisma.task.updateMany.mockResolvedValue({ count: 1 });
      prisma.task.findFirst.mockResolvedValue(updatedTask);

      const result = await service.update('user-id', '1', { done: true, title: 'Updated Task' });

      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' },
        data: { done: true, title: 'Updated Task' },
      });

      expect(prisma.task.findFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' },
      });

      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      prisma.task.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('user-id', '1');

      expect(prisma.task.deleteMany).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user-id' },
      });
      expect(result).toEqual({ count: 1 });
    });
  });
});
