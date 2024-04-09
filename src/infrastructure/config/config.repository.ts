import type ConfigRepository from "./config.repository.interface";

export default class ConfigRepositoryImpl implements ConfigRepository {
  public readonly PORT = Number(process.env.PORT);

  public readonly PEM_CERT = String(process.env.PEM_CERT);

  public readonly PEM_KEY = String(process.env.PEM_KEY);

  public readonly INTERVAL_CLIENT_CHECK = Number(
    process.env.INTERVAL_CLIENT_CHECK
  );

  public readonly INTERVAL_ROOM_UPDATE = Number(
    process.env.INTERVAL_ROOM_UPDATE
  );
}
