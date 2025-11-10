import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaClient } from '@prisma/client';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import * as session from 'express-session';

const prisma = new PrismaClient();

let createdTaskId: string;

describe('Tasks - Integration', () => {
  let app: INestApplication;
  let server: any;
  let testUserId: string;
  let testProjectId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(
      session({
        secret: 'test-secret-tasks',
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use((req: any, res, next) => {
      req.session.user = { id: testUserId };
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer();

    const user = await prisma.user.create({
      data: {
        name: 'Integration User',
        email: `integration+${Date.now()}@test.local`,
        password: 'test-password',
        picture: '',
      },
    });
    testUserId = user.id;

    const createdProject = await prisma.project.create({
      data: {
        name: 'Projeto de Tarefas',
        description: 'Projeto para testes de integração de tarefas',
        status: 'new',
        user: { connect: { id: testUserId } },
      },
    });
    testProjectId = createdProject.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({ where: { projectId: testProjectId } }).catch(() => {});
    await prisma.project.deleteMany({ where: { id: testProjectId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
    await prisma.$disconnect();
    if (app) await app.close();
  });

  // --- Testes Funcionais ---

  it('deve criar uma nova tarefa para o projeto', async () => {
    const response = await request(server)
      .post('/tasks')
      .send({
        title: 'Tarefa de Integração',
        description: 'Testando a criação de uma tarefa.',
        projectId: testProjectId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Tarefa de Integração');
    expect(response.body.projectId).toBe(testProjectId);

    createdTaskId = response.body.id;
  });

  it('deve listar as tarefas do usuário', async () => {
    const response = await request(server).get('/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('deve atualizar uma tarefa existente', async () => {
    const newTitle = 'Tarefa Atualizada';

    const response = await request(server)
      .patch(`/tasks/${createdTaskId}`)
      .send({ title: newTitle, done: true });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(newTitle);
    expect(response.body.done).toBe(true);
  });

  it('deve deletar a tarefa', async () => {
    const response = await request(server).delete(`/tasks/${createdTaskId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('count');
    expect(response.body.count).toBe(1);
  });
});
