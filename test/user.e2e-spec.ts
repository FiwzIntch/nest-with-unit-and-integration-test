import { Test, TestingModule } from '@nestjs/testing';
import { UserCreateDto } from '@app/user/dto/user-create.dto';
import { INestApplication } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AppModule } from '../src/app.module';
import prisma from './helpers/prisma';
import { clearDb, seedAll } from './helpers/reset';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  const accessToken: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJpYXQiOjE3MTI4Mjg1MzksImV4cCI6MTcxMjgyODgzOX0.A5sTizpQQDV62wCxlz0uaQ3d6Hpa7gvIvSkE2BH1hSM';

  beforeAll(async () => {
    await clearDb();
    await seedAll();
  });

  beforeEach(async () => {
    vi.isFakeTimers();
    vi.setSystemTime(new Date(2024, 3, 10, 16, 45, 0));

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should fetch all users', () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(2);
      });
  });

  it('should fetch one user', () => {
    return request(app.getHttpServer())
      .get('/user/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async (res) => {
        const user = await prisma.user.findUnique({
          where: { id: 1 },
        });

        expect(res.body).toEqual(JSON.parse(JSON.stringify(user)));
      });
  });

  it('should throw user not found', () => {
    return request(app.getHttpServer())
      .get('/user/5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('User not found');
      });
  });

  it('should create a new user', () => {
    const payload: UserCreateDto = {
      email: 'thapanee@gamil.com',
      name: 'thapanee',
      password: 'thapanee',
    };
    return request(app.getHttpServer())
      .post('/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201)
      .then(async (res) => {
        const user = await prisma.user.findFirst({
          orderBy: {
            id: 'desc',
          },
        });
        expect(res.body).toEqual(JSON.parse(JSON.stringify(user)));
      });
  });

  it('should update a user', () => {
    const payload: Prisma.UserUpdateInput = {
      email: 'admin2@test.com',
      name: 'admin no.2',
      password: '222222',
    };
    return request(app.getHttpServer())
      .put('/user/2')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(200)
      .then(async (res) => {
        expect(res.body.id).toEqual(2);
        expect(res.body.email).toEqual(payload.email);
        expect(res.body.password).not.toEqual(payload.password);
      });
  });

  it('should not update a user if not found', () => {
    const payload: Prisma.UserUpdateInput = {
      email: 'kafiwz@test.com',
      name: 'kafiwz',
      password: '444444',
    };
    return request(app.getHttpServer())
      .put('/user/11')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('User not found');
      });
  });

  it('should delete a user', () => {
    return request(app.getHttpServer())
      .delete('/user/2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async () => {
        const user = await prisma.user.findUnique({
          where: { id: 2 },
        });

        expect(user).toBeNull();
      });
  });

  it('should not delete a user if not found', () => {
    return request(app.getHttpServer())
      .delete('/user/2')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('User not found');
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // await app.close();
  });
});
