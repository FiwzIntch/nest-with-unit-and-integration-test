import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { CommentUpdateDto } from './dto/comment-update.dto';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentCreate } from './interface/comment-model.interface';
import { buildInclude } from '@app/util/query.util';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindManyQuery): Promise<Pagination<Comment>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const totalItem = await this.prisma.comment.count();

    const totalPage = Math.ceil(totalItem / pageSize);

    const data = await this.prisma.comment.findMany({
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

  async findOne(id: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async create(dto: CommentCreateDto, userId: number): Promise<Comment> {
    const data: CommentCreate = {
      ...dto,
      userId,
    };

    return this.prisma.comment.create({
      data,
    });
  }

  async update(id: number, data: CommentUpdateDto): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.update({
        where: { id },
        data,
      });
      return comment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Comment not found');
        }
      }
      throw error;
    }
  }

  async delete(id: number): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.delete({
        where: { id },
      });
      return comment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Comment not found');
        }
      }
      throw error;
    }
  }
}
