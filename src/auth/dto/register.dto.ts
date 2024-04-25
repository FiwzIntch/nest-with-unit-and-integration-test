import { IsOptional, IsString } from 'class-validator';
import { LoginDto } from './login.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto extends LoginDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
