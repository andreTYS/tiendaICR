import type { User, UserListItem } from "./user";
import type { Role } from "./user-role";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: {
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User>;
  list(): Promise<UserListItem[]>;
  delete(id: string): Promise<void>;
  countByRole(role: Role): Promise<number>;
}
