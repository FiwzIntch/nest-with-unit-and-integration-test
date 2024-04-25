import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { PostCreateDto } from './post-create.dto';

export class PostUpdateDto extends PartialType(PostCreateDto) {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id?: number;
}
