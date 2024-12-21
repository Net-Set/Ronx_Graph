// File: src/lib/apolloClient.ts
// Create Apollo Client instance
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/98082/test1/version/latest', // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});
export default client;