import { User } from "../../domain/entities";
import UserRepository from "../interfaces/user.repository.interface";

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(user: User): Promise<User> {
    return this.userRepository.create(user);
  }

  async get(id: string): Promise<User> {
    return this.userRepository.get(id);
  }

  async update(user: User): Promise<User> {
    return this.userRepository.update(user);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
