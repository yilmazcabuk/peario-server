import type DTO from "./dto.interface";

export default interface MessageDTO extends DTO<{ content: string }> {}
