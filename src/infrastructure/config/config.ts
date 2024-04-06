import "dotenv/config";

const config = {
  PORT: Number(process.env.PORT),
  PEM_CERT: String(process.env.PEM_CERT),
  PEM_KEY: String(process.env.PEM_KEY),
  INTERVAL_CLIENT_CHECK: Number(process.env.INTERVAL_CLIENT_CHECK),
  INTERVAL_ROOM_UPDATE: Number(process.env.INTERVAL_ROOM_UPDATE),
};

export default config;
