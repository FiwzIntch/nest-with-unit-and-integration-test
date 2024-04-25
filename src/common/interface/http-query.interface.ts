import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { transformIntOptional } from '../transform/base';

export class FindManyQuery {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform((value) => transformIntOptional(value))
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform((value) => transformIntOptional(value))
  pageSize?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsArray()
  joins?: string[];
}
