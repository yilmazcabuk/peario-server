import type { UserRepository } from "../../application/interfaces";
import type { User } from "../../domain/entities";

export default class UserRepositoryImpl implements UserRepository {
  private users: Map<string, User> = new Map();

  public async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  public async get(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  public async update(id: string, user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
