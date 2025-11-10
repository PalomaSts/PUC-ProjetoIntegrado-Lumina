import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import * as session from 'express-session';
import { SessionAuthGuard } from '../auth/session-auth.guard';

function assertTestEnv() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests de integração só podem rodar com NODE_ENV=test.');
  }
}

describe('Projects - Integration (sem wipe)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUserId = 'test-user-id';
  const testUserEmail = 'test@example.com';
  let createdProjectId: string;

  beforeAll(async () => {
    assertTestEnv();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);

    app.use(
      session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );

    app.use((req: any, _res, next) => {
      req.session.user = { id: testUserId };
      next();
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        name: 'Test User',
        email: testUserEmail,
        password: '12345678',
        picture: '',
      },
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  it('deve criar um novo projeto', async () => {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'Projeto de Integração', description: '' });

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
    // opcional: conferir se o projeto criado está na lista
    const hasCreated = response.body.some((p: any) => p.id === createdProjectId);
    expect(hasCreated).toBe(true);
  });

  it('deve atualizar o projeto', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/projects/${createdProjectId}`)
      .send({ name: 'Projeto Atualizado', status: 'in_progress' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Projeto Atualizado');
    expect(response.body.status).toBe('in_progress');
  });

  it('deve deletar o projeto', async () => {
    const response = await request(app.getHttpServer()).delete(`/projects/${createdProjectId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Projeto deletado com sucesso' });

    const list = await request(app.getHttpServer()).get('/projects');
    const stillThere = list.body.some((p: any) => p.id === createdProjectId);
    expect(stillThere).toBe(false);
  });
});
