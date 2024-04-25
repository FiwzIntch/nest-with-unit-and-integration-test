import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PostCreate } from './interface/post-model.interface';
import { PostCreateDto } from './dto/post-create.dto';
import { PostUpdateDto } from './dto/post-update.dto';
import { buildInclude } from '@app/util/query.util';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindManyQuery): Promise<Pagination<Post>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const totalItem = await this.prisma.post.count();

    const totalPage = Math.ceil(totalItem / pageSize);

    const data = await this.prisma.post.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: buildInclude(query.joins),
    });

    const response = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem,
        totalPage,
      },
    };
    return response;
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async create(dto: PostCreateDto, userId: number): Promise<Post> {
    const data: PostCreate = {
      ...dto,
      userId,
    };

    return this.prisma.post.create({
      data,
    });
  }

  async update(id: number, data: PostUpdateDto): Promise<Post> {
    try {
      const post = await this.prisma.post.update({
        where: { id },
        data,
      });
      return post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Post not found');
        }
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Post> {
    try {
      const post = await this.prisma.post.delete({
        where: { id },
      });
      return post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Post not found');
        }
      }
      throw error;
    }
  }
}
