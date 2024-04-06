import type { User } from "../../domain/entities";

export default interface UserRepository {
  create(id?: string, name?: string, roomId?: string): Promise<User>;

  get(id: string): Promise<User>;

  update(id: string, user: User): Promise<void>;

  delete(id: string): Promise<void>;
}
