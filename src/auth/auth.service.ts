import { PrismaService } from '@app/prisma/prisma.service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { hashPassword } from '@app/util/password.util';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { jwtConstant } from './constant';
import { JwtUserPayload } from './interface/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  buildToken(user: User): {
    accessToken: string;
  } {
    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstant.secret,
      expiresIn: jwtConstant.expirationTime,
    });

    return {
      accessToken,
    };
  }

  async register(dto: RegisterDto): Promise<{
    accessToken: string;
  }> {
    const password = await hashPassword(dto.password);

    const data: RegisterDto = {
      ...dto,
      password,
    };

    try {
      const user = await this.prisma.user.create({
        data,
      });
      return this.buildToken(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Email already exists');
        }
      }
      throw error;
    }
  }

  async validate(email: string, plainTextPassword: string): Promise<User> {
    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const isValid = await compare(plainTextPassword, user.password);

      if (!isValid) {
        throw new UnauthorizedException();
      }

      delete (user as Partial<Pick<User, 'password'>>).password;
      return user;
    } catch (error: any) {
      if (error.response.statusCode === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException(error.message);
      } else {
        throw new UnauthorizedException('Incorrect email or password');
      }
    }
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
