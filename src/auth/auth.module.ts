import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [JwtModule.register({}), PassportModule, PrismaModule],
  controllers: [AuthController],
  providers: [JwtService, LocalStrategy, JwtStrategy, AuthService],
})
export class AuthModule {}
