import { User } from "../../domain/entities";

export default interface UserRepository {
  create(user: User): Promise<User>;

  get(id: string): Promise<User>;

  update(id: string, user: User): Promise<void>;

  delete(id: string): Promise<void>;
}
