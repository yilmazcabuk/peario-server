import type { Meta, Stream } from "../../../domain/entities";
import type DTO from "./dto.interface";

export default interface NewRoomDTO
  extends DTO<{ meta: Meta; stream: Stream }> {}
