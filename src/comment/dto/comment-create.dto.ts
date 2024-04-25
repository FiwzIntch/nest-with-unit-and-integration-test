import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CommentCreateDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsNumber()
  postId: number;
}
