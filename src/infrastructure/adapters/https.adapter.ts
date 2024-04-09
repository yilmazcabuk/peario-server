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

    this.create();
  }

  private create() {
    return createServer(this.serverOptions, (_, res) => {
      res.writeHead(200);
      res.end();
    }).listen(this.serverSettings.PORT);
  }
}
