import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PostCreateDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsBoolean()
  published: boolean;
}
