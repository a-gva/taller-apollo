import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { resolvers } from './graphql/resolvers';
import { typeDefs } from './graphql/typeDefs';

const port = Number(process.env.PORT ?? 4010);
const path = '/graphql';

const schema = makeExecutableSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  app.use(path, cors(), express.json(), expressMiddleware(server));

  await new Promise<void>((resolve) => {
    httpServer.listen(port, resolve);
  });

  console.log(`Apollo HTTP ready at http://localhost:${port}${path}`);
}

startServer().catch((error) => {
  console.error('Apollo server failed to start.', error);
  process.exit(1);
});
