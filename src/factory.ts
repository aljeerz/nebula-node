import { NebulaGeneratorFunction, NebulaMultiClientOptions } from "./types";
import { NebulaGraphClient } from "./client";

export class NebulaMultiClientFactory {
  private clients: { [clientName: string]: NebulaGraphClient } = {};
  constructor(private options: NebulaMultiClientOptions,generators?: NebulaGeneratorFunction[]) {
    const clientNames = Object.keys(options);

    clientNames.forEach((cn: string) => {
      this.clients[cn] = new NebulaGraphClient(options[cn],generators);
    });
  }

  client(clientName: string): NebulaGraphClient | undefined {
    return this.clients[clientName] ?? undefined;
  }

  execute(
    clientName: string,
    query: string,
    params: {
      [paramName: string]: string | number;
    }
  ) {
    return this.client(clientName)?.execute(query, params);
  }
}
