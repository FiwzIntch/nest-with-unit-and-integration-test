import { CommentCreateDto } from '@app/comment/dto/comment-create.dto';
import { CommentUpdateDto } from '@app/comment/dto/comment-update.dto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

describe('CommentController (e2e)', () => {
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

  it('should fetch all comments', () => {
    return request(app.getHttpServer())
      .get('/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data).toHaveLength(4);
      });
  });

  it('should fetch one comment', () => {
    return request(app.getHttpServer())
      .get('/comment/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async (res) => {
        const comment = await prisma.comment.findUnique({
          where: { id: 1 },
        });

        expect(res.body).toEqual(JSON.parse(JSON.stringify(comment)));
      });
  });

  it('should throw comment not found', () => {
    return request(app.getHttpServer())
      .get('/comment/5')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Comment not found');
      });
  });

  it('should create a new comment', () => {
    const payload: CommentCreateDto = {
      text: 'this is comment ka',
      postId: 1,
    };
    return request(app.getHttpServer())
      .post('/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(201)
      .then(async (res) => {
        const comment = await prisma.comment.findFirst({
          orderBy: {
            id: 'desc',
          },
        });
        expect(res.body).toEqual(JSON.parse(JSON.stringify(comment)));
      });
  });

  it('should update a comment', () => {
    const payload: CommentUpdateDto = {
      text: 'Hi Hixxxx',
    };

    return request(app.getHttpServer())
      .put('/comment/1')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(200)
      .then(async (res) => {
        expect(res.body.id).toEqual(1);
        expect(res.body.text).toEqual(payload.text);
      });
  });

  it('should not update a comment if not found', () => {
    const payload: CommentUpdateDto = {
      text: 'Hi Hi',
    };

    return request(app.getHttpServer())
      .put('/comment/11')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Comment not found');
      });
  });

  it('/should delete a comment', () => {
    return request(app.getHttpServer())
      .delete('/comment/3')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then(async () => {
        const comment = await prisma.comment.findUnique({
          where: { id: 3 },
        });

        expect(comment).toBeNull();
      });
  });

  it('should not delete a comment if not found', () => {
    return request(app.getHttpServer())
      .delete('/comment/3')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .then(async (res) => {
        expect(res.body.message).toEqual('Comment not found');
      });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // await app.close();
  });
});
