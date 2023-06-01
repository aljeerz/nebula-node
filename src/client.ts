import createClient, { Client, ClientOption } from "@nebula-contrib/nebula-nodejs/nebula";
import { NebulaGeneratedData, NebulaGeneratorFunction } from "./types";
import { NebulaGraphTransformsHelper } from "./helper";

export class NebulaGraphClient {
  client: Client;
  generators?: NebulaGeneratorFunction[] = [];
  constructor(options: ClientOption, generators?: NebulaGeneratorFunction[]) {
    this.client = createClient(options);
    this.generators = generators;
  }

  async execute(
    query: string,
    params: any
  ): Promise<{
    error?: any;
    generated: NebulaGeneratedData;
    query: string;
    response?: any;
  }> {
    const queryAfterGenerators = NebulaGraphTransformsHelper.execGeneratorFunctions(query, this.generators);
    const sanitisedQuery = NebulaGraphTransformsHelper.replaceParamsIntoQuery(queryAfterGenerators.query, params);
    try {
      const response = await this.client.execute(sanitisedQuery);
      return {
        generated: queryAfterGenerators.generated,
        query: sanitisedQuery,
        response,
      };
    } catch (err) {
      return {
        error: err,
        generated: queryAfterGenerators.generated,
        query: sanitisedQuery,
      };
    }
  }
}
