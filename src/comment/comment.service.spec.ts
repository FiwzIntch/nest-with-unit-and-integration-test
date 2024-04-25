import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { expect, describe, beforeEach, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { Comment, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@app/prisma/prisma.service';
import { Pagination } from '@app/common/interface/pagination.interface';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import lodash from 'lodash';
import { CommentUpdateDto } from './dto/comment-update.dto';

describe('CommentService', () => {
  let service: CommentService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let comments: Comment[];

  beforeEach(async () => {
    vi.isFakeTimers();

    comments = [
      {
        id: 1,
        text: `unit test title`,
        postId: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        text: `uccccce`,
        postId: 1,
        userId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<CommentService>(CommentService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of comments (find all)', async () => {
    const page = 1;
    const pageSize = 1;
    const data: Comment[] = comments;

    const result: Pagination<Comment> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: comments.length,
        totalPage: 2,
      },
    };
    prismaService.comment.count.mockResolvedValueOnce(data.length);
    prismaService.comment.findMany.mockResolvedValueOnce(data);

    expect(
      await service.findAll({
        page,
        pageSize,
      }),
    ).toEqual(result);
  });

  it('should return an array of comments with empty query (find all)', async () => {
    const page = 1;
    const pageSize = 10;
    const data: Comment[] = comments;

    const result: Pagination<Comment> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: comments.length,
        totalPage: 1,
      },
    };
    prismaService.comment.count.mockResolvedValueOnce(data.length);
    prismaService.comment.findMany.mockResolvedValueOnce(data);

    expect(await service.findAll({})).toEqual(result);
  });

  it('should throw error when comment id not found (find one)', async () => {
    const id = 2;

    prismaService.comment.findUnique.mockResolvedValueOnce(null);

    expect(service.findOne(id)).rejects.toThrowError(
      new NotFoundException('Comment not found'),
    );
  });

  it('should return comment (find one)', async () => {
    const id = 1;
    const result: Comment = comments[0];

    prismaService.comment.findUnique.mockResolvedValueOnce(result);

    expect(await service.findOne(id)).toBe(result);
    expect(prismaService.comment.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should call create with payload (create)', async () => {
    const dto = lodash.omit(comments[0], [
      'createdAt',
      'updatedAt',
      'id',
      'userId',
    ]);

    const userIdObject = lodash.pick(comments[0], ['userId']);
    const userId = Object.values(userIdObject)[0];

    const payload = {
      ...dto,
      userId,
    };

    prismaService.comment.create.mockResolvedValueOnce(comments[0]);

    expect(await service.create(dto, userId)).toStrictEqual(comments[0]);
    expect(prismaService.comment.create).toHaveBeenCalledWith({
      data: payload,
    });
  });

  it('should update post (update)', async () => {
    const id = 1;
    const dto: CommentUpdateDto = {
      text: 'xxwdwd',
    };

    prismaService.comment.update.mockResolvedValueOnce(comments[0]);

    await service.update(id, dto);

    expect(prismaService.comment.update).toHaveBeenCalledWith({
      where: { id },
      data: dto,
    });
  });

  it('should throw error when comment id not found (update)', async () => {
    const id = 11;
    const dto: CommentUpdateDto = {
      text: 'hahah',
    };

    prismaService.comment.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.update(id, dto)).rejects.toThrowError(
      new NotFoundException('Comment not found'),
    );
  });

  it('should throw error when got random error (update)', async () => {
    const id = 11;
    const dto: CommentUpdateDto = {
      text: 'hahah',
    };

    prismaService.comment.update.mockRejectedValueOnce(
      new Error('Random Error'),
    );

    expect(service.update(id, dto)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });

  it('should delete post (remove)', async () => {
    const id = 1;

    prismaService.comment.delete.mockResolvedValueOnce(comments[0]);

    await service.delete(id);

    expect(prismaService.comment.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should throw error when comment id not found (remove)', async () => {
    const id = 1;

    prismaService.comment.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.delete(id)).rejects.toThrowError(
      new NotFoundException('Comment not found'),
    );
  });

  it('should throw error when got random error (remove)', async () => {
    const id = 11;

    prismaService.comment.delete.mockRejectedValueOnce(
      new Error('Random Error'),
    );

    expect(service.delete(id)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });
});
