import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
import { PostCreateDto } from '@app/post/dto/post-create.dto';
import { PostUpdateDto } from '@app/post/dto/post-update.dto';

describe('PostController (e2e)', () => {
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

  it('should fetch all posts', () => {
    return request(app.getHttpServer())
      .get('/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(2);
      });
  });

  it('should fetch one post', () => {
    return request(app.getHttpServer())
      .get('/post/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async (res) => {
        const post = await prisma.post.findUnique({
          where: { id: 1 },
        });

        expect(res.body).toEqual(JSON.parse(JSON.stringify(post)));
      });
  });

  it('should throw post not found', () => {
    return request(app.getHttpServer())
      .get('/post/5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Post not found');
      });
  });

  it('should create a new post', () => {
    const payload: PostCreateDto = {
      title: 'Hello world',
      content: 'eiei',
      published: true,
    };
    return request(app.getHttpServer())
      .post('/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201)
      .then(async (res) => {
        const post = await prisma.post.findFirst({
          orderBy: {
            id: 'desc',
          },
        });
        expect(res.body).toEqual(JSON.parse(JSON.stringify(post)));
      });
  });

  it('should update a post', () => {
    const payload: PostUpdateDto = {
      title: 'Hi Hi',
    };

    return request(app.getHttpServer())
      .put('/post/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(200)
      .then(async (res) => {
        expect(res.body.id).toEqual(1);
        expect(res.body.title).toEqual(payload.title);
      });
  });

  it('should not update a post if not found', () => {
    const payload: PostUpdateDto = {
      title: 'Hi Hi',
    };

    return request(app.getHttpServer())
      .put('/post/11')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Post not found');
      });
  });

  it('/should delete a post', () => {
    return request(app.getHttpServer())
      .delete('/post/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async () => {
        const post = await prisma.post.findUnique({
          where: { id: 1 },
        });

        expect(post).toBeNull();
      });
  });

  it('should not delete a post if not found', () => {
    return request(app.getHttpServer())
      .delete('/post/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Post not found');
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // await app.close();
  });
});
