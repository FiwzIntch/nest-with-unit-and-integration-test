import { PrismaService } from '@app/prisma/prisma.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { AuthService } from './auth.service';
import { jwtConstant } from './constant';
import { RegisterDto } from './dto/register.dto';
import lodash from 'lodash';

vi.mock('@app/util/password.util');

vi.mock('bcrypt', () => ({
  compare: vi.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: DeepMockProxy<JwtService>;
  let prismaService: DeepMockProxy<PrismaClient>;
  let answerToken: string;
  let user: User;

  beforeEach(async () => {
    answerToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJpYXQiOjE3MTI4Mjg1MzksImV4cCI6MTcxMjgyODgzOX0.A5sTizpQQDV62wCxlz0uaQ3d6Hpa7gvIvSkE2BH1hSM';

    user = {
      email: 'admin@test.com',
      name: 'admin',
      password: 'sdfsfdsxxx',
      createdAt: new Date(),
      updatedAt: new Date(),
      id: 1,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())

      .compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build a token', () => {
    const payload: User = user;

    jwtService.sign.mockReturnValue(answerToken);

    expect(service.buildToken(payload)).toEqual({
      accessToken: answerToken,
    });

    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: payload.id,
        email: payload.email,
      },
      {
        secret: jwtConstant.secret,
        expiresIn: jwtConstant.expirationTime,
      },
    );
  });

  it('should register a user', async () => {
    const dto: RegisterDto = {
      name: 'admin',
      email: 'admin@test.com',
      password: 'sdfsfds',
    };

    // mock create user
    prismaService.user.create.mockResolvedValueOnce(user);

    // call to mock build token
    vi.spyOn(service, 'buildToken').mockResolvedValue({
      accessToken: answerToken,
    });

    expect(await service.register(dto)).toStrictEqual({
      accessToken: answerToken,
    });

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        name: 'admin',
        email: 'admin@test.com',
        password: 'sdfsfdsxxxx',
      },
    });
  });

  it('should register a user with existing email', async () => {
    const dto: RegisterDto = {
      name: 'admin',
      email: 'admin@test.com',
      password: 'sdfsfds',
    };

    // mock email exist
    prismaService.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '4.8.0',
        },
      ),
    );

    expect(service.register(dto)).rejects.toThrowError(
      new NotFoundException('Email already exists'),
    );
  });

  it('should register a user with random error', async () => {
    const dto: RegisterDto = {
      name: 'admin',
      email: 'admin@test.com',
      password: 'sdfsfds',
    };

    // mock random error
    prismaService.user.create.mockRejectedValueOnce(new Error('Random Error'));

    expect(service.register(dto)).rejects.toThrowError(
      new InternalServerErrorException('Random Error'),
    );
  });

  it('should validate user', async () => {
    const bcrypt = await import('bcrypt');
    const email = 'admin@test.com';
    const password = 'sdfsfds';
    const hashPassword = user.password;

    const answer = lodash.omit(user, ['password']);

    // mock find user by email
    prismaService.user.findUnique.mockResolvedValueOnce(user);

    expect(await service.validate(email, password)).toStrictEqual(answer);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashPassword);
  });

  it('should validate user with wrong email', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(null);

    expect(service.validate(user.email, user.password)).rejects.toThrowError(
      new UnauthorizedException('Incorrect email or password'),
    );
  });

  it('should validate user with bad request error', async () => {
    prismaService.user.findUnique.mockRejectedValueOnce(
      new BadRequestException('Bad Request'),
    );

    expect(service.validate(user.email, user.password)).rejects.toThrowError(
      new BadRequestException('Bad Request'),
    );
  });

  it('should throw error when user not found', () => {
    const id = 11;

    prismaService.user.findUnique.mockResolvedValueOnce(null);

    expect(service.findUserById(id)).rejects.toThrowError(
      new NotFoundException('User not found'),
    );
  });

  it('should return user', async () => {
    prismaService.user.findUnique.mockResolvedValueOnce(user);

    expect(await service.findUserById(user.id)).toStrictEqual(user);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });
});
