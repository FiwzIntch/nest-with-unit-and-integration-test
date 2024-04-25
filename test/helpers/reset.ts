import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { PostCreate } from '@app/post/interface/post-model.interface';
import * as bcrypt from 'bcrypt';
import { CommentCreate } from '@app/comment/interface/comment-model.interface';

function hash(password: string) {
  // hash password by ussing bcrypt
  return bcrypt.hashSync(password, 10);
}

async function seedUser() {
  const users: Prisma.UserCreateInput[] = [
    {
      email: 'admin@test.com',
      password: hash('111111'),
      name: 'admin',
    },
    {
      email: 'user@test.com',
      password: hash('222222'),
      name: 'user',
    },
  ];

  await prisma.user.createMany({ data: users });
}

async function seedPost() {
  const posts: PostCreate[] = [
    {
      title: 'Post By User 1',
      published: false,
      userId: 1,
    },
    {
      title: 'Post By User 2',
      published: true,
      userId: 2,
    },
  ];

  await prisma.post.createMany({ data: posts });
}

async function seedComment() {
  const comments: CommentCreate[] = [
    {
      text: 'this is comment ka',
      postId: 1,
      userId: 1,
    },
    {
      text: 'bruhhhh',
      postId: 1,
      userId: 2,
    },
    {
      text: 'this comment 3',
      postId: 2,
      userId: 1,
    },
    {
      text: 'this comment 4',
      postId: 2,
      userId: 2,
    },
  ];

  await prisma.comment.createMany({ data: comments });
}

export async function seedAll() {
  await seedUser();
  await seedPost();
  await seedComment();
}
export async function clearDb() {
  await prisma.$transaction([
    prisma.user.deleteMany({}),
    prisma.post.deleteMany({}),
    prisma.comment.deleteMany({}),
    prisma.$queryRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1`,
    prisma.$queryRaw`ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`,
    prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`,
  ]);
}
