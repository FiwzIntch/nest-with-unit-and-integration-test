// example of user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { expect, describe, beforeEach, it, vi } from 'vitest';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from '@app/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as lodash from 'lodash';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { Pagination } from '@app/common/interface/pagination.interface';

describe('UserService', () => {
  let service: UserService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let users: User[];

  beforeEach(async () => {
    vi.isFakeTimers();
    users = [
      {
        email: 'admin@test.com',
        name: 'admin',
        password: 'sdfsfds',
        createdAt: new Date(),
        updatedAt: new Date(),
        id: 1,
      },
    ];
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of users (find all)', async () => {
    const page = 1;
    const pageSize = 20;
    const data: User[] = users;

    const result: Pagination<User> = {
      data,
      pagination: {
        page,
        pageSize,
        totalItem: data.length,
        totalPage: Math.ceil(data.length / pageSize),
      },
    };
    prismaService.user.count.mockResolvedValueOnce(data.length);
    prismaService.user.findMany.mockResolvedValueOnce(data);

    expect(
      await service.findAll({
        page,
        pageSize,
      }),
    ).toEqual(result);
  });

  it('should throw error when user id not found (find one)', async () => {
    const id = 2;

    prismaService.user.findUnique.mockResolvedValueOnce(null);

    expect(service.findOne(id)).rejects.toThrowError(
      new NotFoundException('User not found'),
    );
  });

  it('should return user (find one)', async () => {
    const id = 1;
    const result: User = {
      email: 'admin@test.com',
      name: 'admin',
      password: 'sdfsfds',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 1,
    };

    prismaService.user.findUnique.mockResolvedValueOnce(result);

    expect(await service.findOne(id)).toBe(result);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should call create with payload (create)', async () => {
    const payload: UserCreateDto = lodash.omit(users[0], [
      'createdAt',
      'updatedAt',
      'id',
      'name',
    ]);

    prismaService.user.create.mockResolvedValueOnce(users[0]);

    expect(await service.create(payload)).toStrictEqual(users[0]);
    expect(prismaService.user.create).toHaveBeenCalledWith({ data: payload });
  });

  it('should update user (update)', async () => {
    const id = 1;
    const payload: UserUpdateDto = {
      email: 'admin@test.com',
      name: 'admin',
      password: 'xxxx',
    };

    prismaService.user.update.mockResolvedValueOnce(users[0]);

    await service.update(id, payload);

    expect(prismaService.user.update).toHaveBeenCalledWith({
      where: { id },
      data: payload,
    });
  });

  it('should throw error when user id not found (update)', async () => {
    const id = 11;
    const payload: UserUpdateDto = {
      email: 'admin@test.com',
      name: 'admin',
      password: 'xxxx',
    };

    prismaService.user.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.update(id, payload)).rejects.toThrowError(
      new NotFoundException('User not found'),
    );
  });

  it('should throw error when got random error (update)', async () => {
    const id = 11;
    const payload: UserUpdateDto = {
      email: 'admin@test.com',
      name: 'admin',
      password: 'xxxx',
    };

    prismaService.user.update.mockRejectedValueOnce(new Error('Random Error'));

    expect(service.update(id, payload)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });

  it('should delete user (remove)', async () => {
    const id = 1;

    prismaService.user.delete.mockResolvedValueOnce(users[0]);

    await service.remove(id);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });

  it('should throw error when user id not found (remove)', async () => {
    const id = 1;

    prismaService.user.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('id not found', {
        code: 'P2025',
        clientVersion: '4.8.0',
      }),
    );

    expect(service.remove(id)).rejects.toThrowError(
      new NotFoundException('User not found'),
    );
  });

  it('should throw error when got random error (remove)', async () => {
    const id = 11;

    prismaService.user.delete.mockRejectedValueOnce(new Error('Random Error'));

    expect(service.remove(id)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });
});
