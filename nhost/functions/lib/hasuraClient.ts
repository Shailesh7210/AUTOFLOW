// Hasura Admin Client Helper
const HASURA_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'nhost-admin-secret';

export async function hasuraRequest(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(`Hasura GraphQL Error: ${json.errors[0].message}`);
  }
  return json.data;
}
