import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import lodash from 'lodash';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: DeepMockProxy<UserService>;
  let users: User[];

  beforeEach(async () => {
    users = [
      {
        id: 1,
        email: 'admin@test.com',
        password: '111111',
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockDeep<UserService>())
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find all user', async () => {
    service.findAll.mockResolvedValueOnce(users);

    expect(await controller.findAll()).toStrictEqual(users);

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find user by id', async () => {
    const id = 1;

    service.findOne.mockResolvedValueOnce(users[0]);

    expect(await controller.findOne(id)).toStrictEqual(users[0]);

    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('should create a user', async () => {
    const dto: UserCreateDto = lodash.omit(users[0], [
      'createdAt',
      'updatedAt',
      'id',
      'name',
    ]);

    service.create.mockResolvedValueOnce(users[0]);

    expect(await controller.create(dto)).toStrictEqual(users[0]);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should update a user by id', async () => {
    const id = 1;
    const dto: UserUpdateDto = lodash.omit(users[0], [
      'createdAt',
      'updatedAt',
      'name',
    ]);

    service.update.mockResolvedValueOnce(users[0]);

    expect(await controller.update(id, dto)).toStrictEqual(users[0]);

    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  it('should delete a user by id', async () => {
    const id = 1;

    service.remove.mockResolvedValueOnce(users[0]);

    expect(await controller.remove(id)).toStrictEqual(users[0]);

    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
