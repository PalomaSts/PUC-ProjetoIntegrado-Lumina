import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { MockAuthGuard } from '../test-utils/mock-auth.guard';
import * as session from 'express-session';

describe('Tasks - Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUserId = 'test-user-id';
  let testProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );

    app.use((req, res, next) => {
      req.session.user = { id: testUserId };
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        password: '12345678',
        picture: '',
      },
    });

    const project = await prisma.project.create({
      data: {
        name: 'Projeto Teste',
        status: 'new',
        userId: testUserId,
      },
    });

    testProjectId = project.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('deve criar uma nova tarefa', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Nova tarefa', projectId: testProjectId });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Nova tarefa');
    expect(response.body.done).toBe(false);
    expect(response.body.projectId).toBe(testProjectId);
  });

  it('deve listar as tarefas do usuário', async () => {
    const response = await request(app.getHttpServer()).get('/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0]).toHaveProperty('done');
  });
});
