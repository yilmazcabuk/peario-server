import { User } from "../../domain/entities";

export default interface UserRepository {
  create(user: User): Promise<User>;

  get(id: string): Promise<User>;

  update(user: User): Promise<User>;

  delete(id: string): Promise<void>;
}