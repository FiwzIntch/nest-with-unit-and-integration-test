import { genSaltSync, hash } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = genSaltSync(10);
  const hashed = await hash(password, salt);
  return hashed;
};
