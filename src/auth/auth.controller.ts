import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalGuard } from './guard/local.guard';
import { RequestWithJwtDecoded, RequestWithUser } from './interface/request';
import { JwtGuard } from './guard/jwt.guard';
import { User } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  async me(@Req() req: RequestWithJwtDecoded): Promise<User> {
    return this.service.findUserById(req.user.sub);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Req() request: RequestWithUser) {
    return this.service.buildToken(request.user);
  }
}
