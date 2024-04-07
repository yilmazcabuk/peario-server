export default interface ConfigRepository {
  PORT: number;
  PEM_CERT: string;
  PEM_KEY: string;
  INTERVAL_CLIENT_CHECK: number;
  INTERVAL_ROOM_UPDATE: number;
}
