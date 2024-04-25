import { User } from '@prisma/client';
import { Request } from 'express';
import { JwtUserPayload } from './jwt';

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithJwtDecoded extends Request {
  user: JwtUserPayload;
}
