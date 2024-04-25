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
import { PostService } from './post.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { Post as PostModel } from '@prisma/client';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Pagination } from '@app/common/interface/pagination.interface';
import { PostCreateDto } from './dto/post-create.dto';
import { User } from '@app/common/decorator/user.decorator';
import { JwtUserPayload } from '@app/auth/interface/jwt';
import { PostUpdateDto } from './dto/post-update.dto';

@ApiTags('Post')
@UseGuards(JwtGuard)
@Controller('post')
export class PostController {
  constructor(private service: PostService) {}

  @Get()
  async findAll(@Query() query: FindManyQuery): Promise<Pagination<PostModel>> {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<PostModel> {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() data: PostCreateDto,
    @User() user: JwtUserPayload,
  ): Promise<PostModel> {
    return this.service.create(data, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: PostUpdateDto,
  ): Promise<PostModel> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<PostModel> {
    return this.service.delete(id);
  }
}
