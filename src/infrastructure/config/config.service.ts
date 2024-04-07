import type ConfigRepository from "./config.repository.interface";

export default class ConfigService {
  constructor(private configRepository: ConfigRepository) {}

  public get settings() {
    return this.configRepository;
  }
}
