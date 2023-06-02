[![CI](https://github.com/aljeerz/nebula-node/actions/workflows/main.yml/badge.svg)](https://github.com/aljeerz/nebula-node/actions/workflows/main.yml) [![Publish](https://github.com/aljeerz/nebula-node/actions/workflows/publish.yml/badge.svg)](https://github.com/aljeerz/nebula-node/actions/workflows/publish.yml)

# `@aljeerz/nebula-node`

This Repository Provides A Wrapper with Extra Utility to the [NodeJS Nebula Graph Client](https://github.com/nebula-contrib/nebula-node)

## Features

For Base Client Features and Config please refer to [NodeJS Nebula Graph Client Repository](https://github.com/nebula-contrib/nebula-node)

This Package offers :

- Query Transformer using Objects as Parameters and Internal Functions
- Multi Client Support (Multi Space Usecase)

Security Features :

- Auto Escape Parameters ( Avoid Diret String Concatination )

Quality Of Life :

- Provides an interface for Generator Functions (Example Below)

## Installation

```
npm install @aljeerz/nebula-node @nebula-contrib/nebula-nodejs
```

## MultiClient Usage ( Basic )

```typescript
const mcOptions = {
  main: {
    // ClientOptions from @nebula-contrib/nebula-nodejs
    ...mainClientOptions,
  },
  aux: {
    // ClientOptions from @nebula-contrib/nebula-nodejs
    ...auxClientOptions,
  },
};

// Init
const mcFactory = new NebulaMultiClientFactory(mcOptions);

// Method 1 : Execute Query On Client
const resPromise = mcFactory.execute("main", query, params);

// Method 2 : Get a NebulaGraphClient instance
const mainClient = mcFactory.client("main");
const auxClient = mcFactory.client("aux");

const resPromise = auxClient.execute(query, params);
```

## Single Client Usage ( Basic )

```typescript
const mainClientOptions = {
  // ClientOptions from @nebula-contrib/nebula-nodejs
  ...options,
};

// Init
const mainClient = new NebulaGraphClient(mainClientOptions);

// Execute Query
const resPromise = mainClient.execute(query, params);
```

## Params & Generators Example

Using Multi Clients For the Example

```typescript
const multiClientOptions = {
  main: {
    servers: ["127.0.0.1:9669", "127.0.0.1:9779"],
    userName: "username",
    password: "supersecurepass",
    space: "mymainspace",
  },
  aux: {
    servers: ["127.0.0.1:9669"],
    userName: "username",
    password: "supersecurepass",
    space: "mymainspace",
  },
};

const IdGenerator = {
    namespace: "aljeerz",
    name: "id",
    execute: function() {
        return `${Date.now()}0${process.pid}` // Returns string or number
    }
}

const nebulaClients = new NebulaMultiClientFactory(multiClientOptions,[
    IdGenerator,...otherGenerators
]);

// Get: NebulaGraphClient
const ngqlMain = nebulaClients.client("main");
const ngqlAux = nebulaClients.client("aux");

// Execute Query

const R = await ngqlMain?.execute(`YIELD aljeerz::id() as id, "$unsafeString" as safeString`, {
  unsafeString: `"possibly""malicious'"`,
});

console.log(R)
// Output
R : {
    error:  undefined,// on error contains thrown error object
    query: `YIELD 1685631222227018925 as id, "\"possibly\"\"malicious\'\"" as safeString`,
    generated: {
        aljeerz: {
            id: [
                1685631222227018925
            ]
        }
    },
    response: {...} 
    /* On Success: Response from @nebula-contrib/nebula-nodejs Client execute
       On Error : undefined
    */

}
```

Execute Output Type

```typescript
  Promise<{
    error?: any;
    generated: NebulaGeneratedData;
    query: string;
    response?: any;
  }>;
```
