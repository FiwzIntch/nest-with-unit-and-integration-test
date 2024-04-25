import { JwtUserPayload } from '@app/auth/interface/jwt';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { Comment } from '@prisma/client';
import lodash from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentUpdateDto } from './dto/comment-update.dto';

describe('CommentController', () => {
  let controller: CommentController;
  let service: DeepMockProxy<CommentService>;
  let comments: Comment[];

  beforeEach(async () => {
    comments = [
      {
        id: 1,
        text: `unit test title`,
        postId: 1,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [CommentService],
    })
      .overrideProvider(CommentService)
      .useValue(mockDeep<CommentService>())
      .compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get(CommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all comment', async () => {
    const query: FindManyQuery = {
      page: 1,
      pageSize: 10,
    };

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const answer: Pagination<Comment> = {
      data: comments,
      pagination: {
        page,
        pageSize,
        totalItem: comments.length,
        totalPage: Math.ceil(comments.length / pageSize),
      },
    };
    service.findAll.mockResolvedValueOnce(answer);

    expect(await controller.findAll(query)).toStrictEqual(answer);

    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should find comment by id', async () => {
    const id = 1;

    service.findOne.mockResolvedValueOnce(comments[0]);

    expect(await controller.findOne(id)).toStrictEqual(comments[0]);

    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should create a post', async () => {
    const jwtDecode: JwtUserPayload = {
      sub: 1,
      email: 'admin@test.com',
    };

    const dto: CommentCreateDto = lodash.omit(comments[0], [
      'createdAt',
      'updatedAt',
      'id',
      'userId',
    ]);

    service.create.mockResolvedValueOnce(comments[0]);

    expect(await controller.create(dto, jwtDecode)).toStrictEqual(comments[0]);

    expect(service.create).toHaveBeenCalledWith(dto, jwtDecode.sub);
  });

  it('should update a comment by id', async () => {
    const id = 1;
    const dto: CommentUpdateDto = lodash.omit(comments[0], [
      'createdAt',
      'updatedAt',
      'userId',
    ]);

    service.update.mockResolvedValueOnce(comments[0]);

    expect(await controller.update(id, dto)).toStrictEqual(comments[0]);

    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a comment by id', async () => {
    const id = 1;

    service.delete.mockResolvedValueOnce(comments[0]);

    expect(await controller.delete(id)).toStrictEqual(comments[0]);

    expect(service.delete).toHaveBeenCalledWith(id);
  });
});
