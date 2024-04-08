import type { Player } from "../../../domain/entities";
import type DTO from "./dto.interface";

export default interface SyncDTO extends DTO<{ player: Player }> {}
