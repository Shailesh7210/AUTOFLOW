import { NhostClient } from '@nhost/nhost-js';

const backendUrl = process.env.NEXT_PUBLIC_NHOST_BACKEND_URL || 'http://localhost:1337';
const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';

export const nhost = new NhostClient({
  subdomain: 'local',
  region: 'local',
  graphqlUrl,
  functionsUrl: `${backendUrl}/v1/functions`,
});
