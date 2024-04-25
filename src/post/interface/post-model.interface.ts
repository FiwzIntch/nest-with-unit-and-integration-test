import { Post, User } from '@prisma/client';

export interface PostCreate {
  title: string;
  content?: string;
  published: boolean;
  userId: number;
}

export interface PostWithJoins extends Post {
  user?: User;
}
