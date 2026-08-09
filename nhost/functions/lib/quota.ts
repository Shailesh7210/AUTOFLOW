import { hasuraRequest } from './hasuraClient';

export async function checkAndIncrementQuota(orgId: string): Promise<{ allowed: boolean; reason?: string }> {
  const query = `
    query GetOrgQuota($id: uuid!) {
      organizations_by_pk(id: $id) {
        id
        quota_limit
        quota_used
      }
    }
  `;

  const data = await hasuraRequest(query, { id: orgId });
  const org = data.organizations_by_pk;

  if (!org) {
    return { allowed: false, reason: 'Organization not found' };
  }

  if (org.quota_used >= org.quota_limit) {
    return {
      allowed: false,
      reason: `Organization monthly usage quota limit reached (${org.quota_used}/${org.quota_limit})`,
    };
  }

  // Increment usage count
  const updateMutation = `
    mutation IncrementQuota($id: uuid!, $newUsed: Int!) {
      update_organizations_by_pk(
        pk_columns: { id: $id },
        _set: { quota_used: $newUsed }
      ) {
        quota_used
      }
    }
  `;

  await hasuraRequest(updateMutation, { id: orgId, newUsed: org.quota_used + 1 });
  return { allowed: true };
}
