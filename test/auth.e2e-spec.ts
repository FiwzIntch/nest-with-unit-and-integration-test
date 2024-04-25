import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from '@app/auth/dto/login.dto';
import { RegisterDto } from '@app/auth/dto/register.dto';
import { JwtUserPayload } from '@app/auth/interface/jwt';
import { INestApplication } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';
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

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

  it('should register', () => {
    const payload: RegisterDto = {
      name: 'admin number 3',
      email: 'admin3@test.com',
      password: '333333',
    };

    return request(app.getHttpServer())
      .post('/auth/register')
      .expect(201)
      .send(payload)
      .then(async (res) => {
        expect(res.body).toHaveProperty('accessToken');

        const user = await prisma.user.findFirst({
          orderBy: {
            id: 'desc',
          },
        });

        expect(user?.email).toEqual(payload.email);
        expect(user?.name).toEqual(payload.name);
        expect(user?.password).not.toEqual(payload.password);

        const accessToken = res.body.accessToken;
        const decodedAccessToken = jwtDecode<JwtUserPayload>(accessToken);
        expect(decodedAccessToken.sub).toEqual(user?.id);
        expect(decodedAccessToken.email).toEqual(user?.email);
      });
  });

  it('should not register if email already exists', () => {
    const payload: RegisterDto = {
      name: 'admin',
      email: 'admin@test.com',
      password: '111111',
    };
    return request(app.getHttpServer())
      .post('/auth/register')
      .expect(400)
      .send(payload)
      .then(async (res) => {
        expect(res.body.message).toEqual('Email already exists');
      });
  });

  it('should login with correct credentials', () => {
    const payload: LoginDto = {
      email: 'admin@test.com',
      password: '111111',
    };
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(201)
      .send(payload)
      .then(async (res) => {
        expect(res.body).toHaveProperty('accessToken');
        const accessToken = res.body.accessToken;
        const decodedAccessToken = jwtDecode<JwtUserPayload>(accessToken);
        expect(decodedAccessToken).toHaveProperty('sub');
        expect(decodedAccessToken).toHaveProperty('email');
      });
  });

  it('should login with incorrect password', () => {
    const payload: LoginDto = {
      email: 'admin@test.com',
      password: '1',
    };
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(401)
      .send(payload)
      .then(async (res) => {
        expect(res.body.message).toEqual('Incorrect email or password');
      });
  });

  it('should login with incorrect email', () => {
    const payload: LoginDto = {
      email: 'xxxx@gmail.com',
      password: '1',
    };
    return request(app.getHttpServer())
      .post('/auth/login')
      .expect(401)
      .send(payload)
      .then(async (res) => {
        expect(res.body.message).toEqual('Incorrect email or password');
      });
  });

  it('should not return my profile because of invalid token', () => {
    const accessToken = 'xxwewewe';

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401)
      .then(async (res) => {
        expect(res.body.message).toEqual('Unauthorized');
      });
  });

  it('should return my profile', () => {
    console.log('log date now', new Date());

    const result = {
      id: 1,
      email: 'admin@test.com',
    };

    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJpYXQiOjE3MTI4Mjg1MzksImV4cCI6MTcxMjgyODgzOX0.A5sTizpQQDV62wCxlz0uaQ3d6Hpa7gvIvSkE2BH1hSM';

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async (res) => {
        expect(res.body).toHaveProperty('id', result.id);
        expect(res.body).toHaveProperty('email', result.email);
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // await app.close();
  });
});
