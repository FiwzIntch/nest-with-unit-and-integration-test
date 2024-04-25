import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RequestWithJwtDecoded, RequestWithUser } from './interface/request';

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockDeep<AuthService>())
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a user', async () => {
    const requestWithJwtDecoded = {
      user: {
        sub: 1,
        email: 'admin@test.com',
      },
    } as RequestWithJwtDecoded;

    const answer: User = {
      id: 1,
      email: 'admin@test.com',
      password: '111111',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service.findUserById.mockResolvedValueOnce(answer);

    expect(await controller.me(requestWithJwtDecoded)).toStrictEqual(answer);

    expect(service.findUserById).toHaveBeenCalledWith(
      requestWithJwtDecoded.user.sub,
    );
  });

  it('should return a token with register', async () => {
    const dto: RegisterDto = {
      name: 'john',
      email: 'john@test.com',
      password: 'jjjj',
    };

    const answer: { accessToken: string } = {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJpYXQiOjE3MTI4Mjg1MzksImV4cCI6MTcxMjgyODgzOX0.A5sTizpQQDV62wCxlz0uaQ3d6Hpa7gvIvSkE2BH1hSM',
    };

    service.register.mockResolvedValueOnce(answer);

    expect(await controller.register(dto)).toStrictEqual(answer);

    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('should return a token with login', async () => {
    const requestWithUser = {
      user: {
        id: 1,
        email: 'admin@test.com',
        password: '111111',
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as RequestWithUser;

    const answer: { accessToken: string } = {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJpYXQiOjE3MTI4Mjg1MzksImV4cCI6MTcxMjgyODgzOX0.A5sTizpQQDV62wCxlz0uaQ3d6Hpa7gvIvSkE2BH1hSM',
    };

    service.buildToken.mockResolvedValueOnce(answer);

    expect(await controller.login(requestWithUser)).toStrictEqual(answer);

    expect(service.buildToken).toHaveBeenCalledWith(requestWithUser.user);
  });
});
