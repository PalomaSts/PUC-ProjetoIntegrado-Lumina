import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import * as session from 'express-session';

describe('Projects - Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUserId = 'test-user-id';
  let createdProjectId: string;

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
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('deve criar um novo projeto', async () => {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Projeto de Integração' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Projeto de Integração');
    expect(response.body.status).toBe('new');

    createdProjectId = response.body.id;
  });

  it('deve listar os projetos do usuário', async () => {
    const response = await request(app.getHttpServer()).get('/projects');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('deve atualizar o projeto', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/projects/${createdProjectId}`)
      .send({ name: 'Projeto Atualizado', status: 'in progress' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Projeto Atualizado');
    expect(response.body.status).toBe('in progress');
  });

  it('deve deletar o projeto', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/projects/${createdProjectId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Projeto deletado com sucesso' });
  });
});
