import bcrypt from "bcryptjs";
import type { PasswordHasher } from "../domain/password-hasher";

const COST = 12;

export const bcryptPasswordHasher: PasswordHasher = {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST);
  },
  async verify(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },
};
