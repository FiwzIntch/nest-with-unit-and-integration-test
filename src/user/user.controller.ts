import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { JwtGuard } from '@app/auth/guard/jwt.guard';

@ApiTags('User')
@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  async findAll(@Query() query: FindManyQuery): Promise<Pagination<User>> {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<User | null> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() data: UserCreateDto): Promise<User> {
    return this.service.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UserUpdateDto,
  ): Promise<User> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return this.service.remove(id);
  }
}
