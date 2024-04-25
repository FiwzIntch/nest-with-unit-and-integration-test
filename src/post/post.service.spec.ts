import { faker } from '@faker-js/faker';
import { Pagination } from '@app/common/interface/pagination.interface';
import { PrismaService } from '@app/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Post, Prisma, PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { PostService } from './post.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import lodash from 'lodash';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostWithJoins } from './interface/post-model.interface';

describe('PostService', () => {
  let service: PostService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let posts: Post[];

  beforeEach(async () => {
    vi.isFakeTimers();
    // posts = [
    //   {
    //     id: 1,
    //     title: `unit test title`,
    //     content: 'xxxx',
    //     published: true,
    //     userId: 1,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // ];
    posts = new Array(10).fill(0).map((_, index) => ({
      id: index + 1,
      title: faker.lorem.sentence(),
      content: faker.lorem.sentence(),
      published: faker.datatype.boolean(),
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of posts (find all)', async () => {
    const page = 1;
    const pageSize = 3;
    const data: Post[] = posts;

    const result: Pagination<Post> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: posts.length,
        totalPage: 4,
      },
    };
    prismaService.post.count.mockResolvedValueOnce(data.length);
    prismaService.post.findMany.mockResolvedValueOnce(data);

    expect(
      await service.findAll({
        page,
        pageSize,
      }),
    ).toEqual(result);
  });

  it('should return an array of posts with user object (find all)', async () => {
    const page = 1;
    const pageSize = 3;
    const joins = ['user'];

    const data: PostWithJoins[] = posts.map((post) => ({
      ...post,
      user: {
        id: post.userId,
        name: 'unit test',
        password: 'xxxx',
        email: 'unit test',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }));

    const result: Pagination<Post> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: posts.length,
        totalPage: 4,
      },
    };
    prismaService.post.count.mockResolvedValueOnce(data.length);
    prismaService.post.findMany.mockResolvedValueOnce(data);

    expect(
      await service.findAll({
        page,
        pageSize,
        joins,
      }),
    ).toEqual(result);
  });

  it('should return an array of posts with empty query (find all)', async () => {
    const page = 1;
    const pageSize = 10;
    const data: Post[] = posts;

    const result: Pagination<Post> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: posts.length,
        totalPage: 1,
      },
    };
    prismaService.post.count.mockResolvedValueOnce(data.length);
    prismaService.post.findMany.mockResolvedValueOnce(data);

    expect(await service.findAll({})).toEqual(result);
  });

  it('should throw error when post id not found (find one)', async () => {
    const id = 2;

    prismaService.comment.findUnique.mockResolvedValueOnce(null);

    expect(service.findOne(id)).rejects.toThrowError(
      new NotFoundException('Post not found'),
    );
  });

  it('should return post (find one)', async () => {
    const id = 1;
    const result: Post = posts[0];

    prismaService.post.findUnique.mockResolvedValueOnce(result);

    expect(await service.findOne(id)).toBe(result);
    expect(prismaService.post.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should call create with payload (create)', async () => {
    const dto = lodash.omit(posts[0], [
      'createdAt',
      'updatedAt',
      'id',
      'userId',
      'content',
    ]);

    const userIdObject = lodash.pick(posts[0], ['userId']);
    const userId = Object.values(userIdObject)[0];

    const payload = {
      ...dto,
      userId,
    };

    prismaService.post.create.mockResolvedValueOnce(posts[0]);

    expect(await service.create(dto, userId)).toStrictEqual(posts[0]);
    expect(prismaService.post.create).toHaveBeenCalledWith({ data: payload });
  });

  it('should update post (update)', async () => {
    const id = 1;
    const dto: PostUpdateDto = {
      title: 'hahah',
      content: 'hahah',
    };

    prismaService.post.update.mockResolvedValueOnce(posts[0]);

    await service.update(id, dto);

    expect(prismaService.post.update).toHaveBeenCalledWith({
      where: { id },
      data: dto,
    });
  });

  it('should throw error when post id not found (update)', async () => {
    const id = 11;
    const dto: PostUpdateDto = {
      title: 'hahah',
      content: 'hahah',
    };

    prismaService.post.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.update(id, dto)).rejects.toThrowError(
      new NotFoundException('Post not found'),
    );
  });

  it('should throw error when got random error (update)', async () => {
    const id = 11;
    const dto: PostUpdateDto = {
      title: 'hahah',
      content: 'hahah',
    };

    prismaService.post.update.mockRejectedValueOnce(new Error('Random Error'));

    expect(service.update(id, dto)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });

  it('should delete post (remove)', async () => {
    const id = 1;

    prismaService.post.delete.mockResolvedValueOnce(posts[0]);

    await service.delete(id);

    expect(prismaService.post.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should throw error when post id not found (remove)', async () => {
    const id = 1;

    prismaService.post.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.delete(id)).rejects.toThrowError(
      new NotFoundException('Post not found'),
    );
  });

  it('should throw error when got random error (remove)', async () => {
    const id = 11;

    prismaService.post.delete.mockRejectedValueOnce(new Error('Random Error'));

    expect(service.delete(id)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });
});
