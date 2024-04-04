import UserRepository from "../../application/interfaces/user.repository.interface";
import { User } from "../../domain/entities";

export default class UserRepositoryImpl implements UserRepository {
  private users: Map<string, User> = new Map();

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async get(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  async update(id: string, user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
