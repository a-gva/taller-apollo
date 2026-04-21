import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";

import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/typeDefs";

const port = Number(process.env.PORT ?? 4010);
const path = "/graphql";

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path,
  });
  const wsCleanup = useServer(
    {
      schema,
      onConnect: () => {
        console.log("[ws] client connected");
      },
      onSubscribe: (_ctx, message) => {
        console.log("[ws] subscribe", JSON.stringify(message.payload));
      },
      onNext: (_ctx, _message, args, result) => {
        const operationName = args.operationName ?? "anonymous";
        console.log(`[ws] next ${operationName}`, JSON.stringify(result));
      },
      onError: (_ctx, _message, errors) => {
        console.log("[ws] error", JSON.stringify(errors));
      },
      onComplete: () => {
        console.log("[ws] subscription complete");
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  app.use(path, cors(), express.json(), expressMiddleware(server));

  await new Promise<void>((resolve) => {
    httpServer.listen(port, resolve);
  });

  console.log(`Apollo HTTP ready at http://localhost:${port}${path}`);
  console.log(`GraphQL WS ready at ws://localhost:${port}${path}`);
}

startServer().catch((error) => {
  console.error("Apollo server failed to start.", error);
  process.exit(1);
});
