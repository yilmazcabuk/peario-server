import { readFileSync } from "fs";
import type { ServerOptions } from "https";
import { createServer, Server } from "https";

interface Settings {
  PEM_CERT: string;
  PEM_KEY: string;
  PORT: number;
}

export default class HttpsAdapter extends Server {
  private serverOptions: ServerOptions;

  constructor(private serverSettings: Settings) {
    super();
    this.serverOptions = {
      cert: readFileSync(serverSettings.PEM_CERT),
      key: readFileSync(serverSettings.PEM_KEY),
    };
  }

  public create() {
    const server = createServer(this.serverOptions, (_, res) => {
      res.writeHead(200);
      res.end();
    });
    server.listen(this.serverSettings.PORT);
    return server;
  }
}
