import type { User } from "../../domain/entities";
import type { UserRepository } from "../interfaces";

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  public async create(
    id?: string,
    name?: string,
    roomId?: string,
  ): Promise<User> {
    return this.userRepository.create(id, name, roomId);
  }

  public async get(id: string): Promise<User> {
    return this.userRepository.get(id);
  }

  public async update(id: string, user: User): Promise<void> {
    return this.userRepository.update(id, user);
  }

  public async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
