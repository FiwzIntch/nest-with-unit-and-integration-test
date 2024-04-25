import { JwtUserPayload } from '@app/auth/interface/jwt';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '@prisma/client';
import lodash from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { PostCreateDto } from './dto/post-create.dto';
import { PostUpdateDto } from './dto/post-update.dto';
import { PostController } from './post.controller';
import { PostService } from './post.service';

describe('PostController', () => {
  let controller: PostController;
  let service: DeepMockProxy<PostService>;
  let posts: Post[];

  beforeEach(async () => {
    posts = [
      {
        id: 1,
        title: `unit test title`,
        content: 'xxxx',
        published: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    })
      .overrideProvider(PostService)
      .useValue(mockDeep<PostService>())
      .compile();

    controller = module.get<PostController>(PostController);
    service = module.get(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all post', async () => {
    const query: FindManyQuery = {
      page: 1,
      pageSize: 10,
    };

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const answer: Pagination<Post> = {
      data: posts,
      pagination: {
        page,
        pageSize,
        totalItem: posts.length,
        totalPage: Math.ceil(posts.length / pageSize),
      },
    };
    service.findAll.mockResolvedValueOnce(answer);

    expect(await controller.findAll(query)).toStrictEqual(answer);

    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('should find post by id', async () => {
    const id = 1;

    service.findOne.mockResolvedValueOnce(posts[0]);

    expect(await controller.findOne(id)).toStrictEqual(posts[0]);

    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should create a post', async () => {
    const jwtDecode: JwtUserPayload = {
      sub: 1,
      email: 'admin@test.com',
    };

    const dto: PostCreateDto = lodash.omit(posts[0], [
      'createdAt',
      'updatedAt',
      'id',
      'userId',
      'content',
    ]);

    service.create.mockResolvedValueOnce(posts[0]);

    expect(await controller.create(dto, jwtDecode)).toStrictEqual(posts[0]);

    expect(service.create).toHaveBeenCalledWith(dto, jwtDecode.sub);
  });

  it('should update a post by id', async () => {
    const id = 1;
    const dto: PostUpdateDto = lodash.omit(posts[0], [
      'createdAt',
      'updatedAt',
      'userId',
      'content',
    ]);

    service.update.mockResolvedValueOnce(posts[0]);

    expect(await controller.update(id, dto)).toStrictEqual(posts[0]);

    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a post by id', async () => {
    const id = 1;

    service.delete.mockResolvedValueOnce(posts[0]);

    expect(await controller.delete(id)).toStrictEqual(posts[0]);

    expect(service.delete).toHaveBeenCalledWith(id);
  });
});
