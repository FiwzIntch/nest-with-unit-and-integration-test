import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CommentCreateDto } from './comment-create.dto';

export class CommentUpdateDto extends PartialType(CommentCreateDto) {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id?: number;
}
