import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { USERS_QUERY } from './graphql/queries/user';

const PORT = 4010;

const client = new ApolloClient({
  link: new HttpLink({ uri: `http://localhost:${PORT}`, fetch }),
  cache: new InMemoryCache(),
});

async function run() {
  const result = await client.query({
    query: USERS_QUERY,
    fetchPolicy: 'no-cache',
  });
  console.log(JSON.stringify(result.data, null, 2));
}

run().catch((error) => {
  console.error('Apollo client query failed.', error);
  process.exit(1);
});
