import type DTO from "./dto.interface";

export default interface UserUpdateDTO extends DTO<{ username: string }> {}
