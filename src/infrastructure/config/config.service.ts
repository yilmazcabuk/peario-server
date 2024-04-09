import type ConfigRepository from "./config.repository.interface";

export default class ConfigService {
  constructor(private configRepository: ConfigRepository) {}

  public get server() {
    return {
      PEM_CERT: this.configRepository.PEM_CERT,
      PEM_KEY: this.configRepository.PEM_KEY,
      PORT: this.configRepository.PORT,
    };
  }

  public get intervals() {
    return {
      INTERVAL_CLIENT_CHECK: this.configRepository.INTERVAL_CLIENT_CHECK,
      INTERVAL_ROOM_UPDATE: this.configRepository.INTERVAL_ROOM_UPDATE,
    };
  }
}
