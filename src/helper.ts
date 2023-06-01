import { NebulaGeneratedData, NebulaGeneratorFunction } from "./types";

export class NebulaGraphTransformsHelper {
    static replaceAll(subject: string, search: string, replace: string) {
      return subject.split(search).join(replace);
    }
  
    // Escapes the following characters : " ' \ 
    static sanitiseParamString(str: string): string {
      return this.replaceAll(this.replaceAll(this.replaceAll(str, "\\", "\\\\"), '"', '\\"'), "'", "\\'");
    }
  
    static replaceParamsIntoQuery(query: string, params: { [paramName: string]: string | number }): string {
      let processedQuery = query;
      Object.keys(params).forEach((key: string) => {
        const paramName = `$${key}`;
        const escText = this.sanitiseParamString(`${params[key]}`);
        processedQuery = this.replaceAll(processedQuery, paramName, escText);
      });
      return processedQuery;
    }
  
    static execGeneratorFunction(
      query: string,
      gen: NebulaGeneratorFunction
    ): {
      generated: (string | number)[];
      query: string;
    } {
      let transformedQuery: string = query;
  
      const search = `${gen.namespace}::${gen.name}()`;
      const splitQuery = query.split(search);
      let generated: (string | number)[] = [];
      if (splitQuery.length > 1) {
        for (let i = 0; i < splitQuery.length - 1; i++) {
          const genData = gen.execute();
          generated.push(genData);
          transformedQuery = transformedQuery.replace(search, `${genData}`);
        }
      } else {
        transformedQuery = splitQuery[0];
      }
  
      return {
        generated,
        query: transformedQuery,
      };
    }
  
    static execGeneratorFunctions(query: string, generators?: NebulaGeneratorFunction[]) {
      let finalQuery = query;
      let generated: NebulaGeneratedData = {};
      if (generators)
        generators.forEach((gen) => {
          const genData = this.execGeneratorFunction(query, gen);
          if (!generated[gen.namespace]) generated[gen.namespace] = {};
          if (!generated[gen.namespace][gen.name]) generated[gen.namespace][gen.name] = [];
          generated[gen.namespace][gen.name].push(...genData.generated);
          finalQuery = genData.query;
        });
  
      return {
        query: finalQuery,
        generated,
      };
    }
  }