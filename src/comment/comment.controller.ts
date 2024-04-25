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
import { CommentService } from './comment.service';
import { JwtGuard } from '@app/auth/guard/jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { FindManyQuery } from '@app/common/interface/http-query.interface';
import { Comment } from '@prisma/client';
import { Pagination } from '@app/common/interface/pagination.interface';
import { JwtUserPayload } from '@app/auth/interface/jwt';
import { User } from '@app/common/decorator/user.decorator';
import { CommentCreateDto } from './dto/comment-create.dto';
import { CommentUpdateDto } from './dto/comment-update.dto';

@ApiTags('Comment')
@UseGuards(JwtGuard)
@Controller('comment')
export class CommentController {
  constructor(private service: CommentService) {}

  @Get()
  async findAll(@Query() query: FindManyQuery): Promise<Pagination<Comment>> {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number): Promise<Comment> {
    return this.service.findOne(id);
  }

  @Post()
  async create(
    @Body() data: CommentCreateDto,
    @User() user: JwtUserPayload,
  ): Promise<Comment> {
    return this.service.create(data, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CommentUpdateDto,
  ): Promise<Comment> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number): Promise<Comment> {
    return this.service.delete(id);
  }
}
