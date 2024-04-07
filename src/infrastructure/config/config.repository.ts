import "dotenv/config";

import type ConfigRepository from "./config.repository.interface";

export default class ConfigRepositoryImpl implements ConfigRepository {
  public readonly PORT: number;

  public readonly PEM_CERT: string;

  public readonly PEM_KEY: string;

  public readonly INTERVAL_CLIENT_CHECK: number;

  public readonly INTERVAL_ROOM_UPDATE: number;

  constructor() {
    this.PORT = Number(process.env.PORT);
    this.PEM_CERT = String(process.env.PEM_CERT);
    this.PEM_KEY = String(process.env.PEM_KEY);
    this.INTERVAL_CLIENT_CHECK = Number(process.env.INTERVAL_CLIENT_CHECK);
    this.INTERVAL_ROOM_UPDATE = Number(process.env.INTERVAL_ROOM_UPDATE);
  }
}
