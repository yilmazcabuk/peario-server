export default interface ConfigRepository {
  PEM_CERT: string;
  PEM_KEY: string;
  PORT: number;
  INTERVAL_CLIENT_CHECK: number;
  INTERVAL_ROOM_UPDATE: number;
}
