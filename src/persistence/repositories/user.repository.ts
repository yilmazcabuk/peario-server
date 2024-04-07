import { User } from "../../domain/entities";
import type { UserRepository } from "../../domain/interfaces";
import {
  idGenerator,
  nameGenerator,
} from "../../infrastructure/utilities/generators";

export default class UserRepositoryImpl implements UserRepository {
  private users: Map<string, User> = new Map();

  public async create(
    id?: string,
    name?: string,
    roomId?: string,
  ): Promise<User> {
    const userId = id || idGenerator();
    const userName = name || nameGenerator(userId);
    const lastActive = Date.now();
    const cooldown = Date.now();
    const userRoomId = roomId || "";
    const user = new User(userId, userName, userRoomId, lastActive, cooldown);
    this.users.set(userId, user);
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
