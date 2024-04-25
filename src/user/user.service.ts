import { PrismaService } from '@app/prisma/prisma.service';
import { hashPassword } from '@app/util/password.util';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: UserCreateDto): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(query: FindManyQuery): Promise<Pagination<User>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const totalItem = await this.prisma.user.count();

    const totalPage = Math.ceil(totalItem / pageSize);

    const data = await this.prisma.user.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
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

  async findOne(id: number): Promise<User | null> {
    // find a user with prevent not found
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, data: UserUpdateDto): Promise<User> {
    // write update user with prevent not found

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }

    // if (!user) {
    //   throw new NotFoundException('User not found');
    // }
    // return user;
  }

  async remove(id: number): Promise<User> {
    // write delete user with prevent not found

    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }
}
