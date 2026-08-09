import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const wsUrl = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:8080/v1/graphql';

const httpLink = new HttpLink({
  uri: httpUrl,
  headers: {
    'x-hasura-admin-secret': 'nhost-admin-secret',
  },
});

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
      createClient({
        url: wsUrl,
        connectionParams: {
          headers: {
            'x-hasura-admin-secret': 'nhost-admin-secret',
          },
        },
      })
    )
  : null;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
