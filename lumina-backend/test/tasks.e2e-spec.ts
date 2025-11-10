import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthGuard } from '@nestjs/passport';

class MockAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    throw new UnauthorizedException();
  }
}

describe('Tasks (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard('google'))
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tasks (GET) should return unauthorized without login', () => {
    return request(app.getHttpServer()).get('/tasks').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
