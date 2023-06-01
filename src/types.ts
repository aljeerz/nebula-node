import { ClientOption } from "@nebula-contrib/nebula-nodejs/nebula/types";

export interface NebulaMultiClientOptions {
  [clientName: string]: ClientOption;
}

export interface NebulaGeneratorFunction {
  namespace: string;
  name: string;
  execute: () => string | number;
}

export interface NebulaGeneratedData {
  [namespace: string]: {
    [name: string]: (string | number)[];
  };
}
