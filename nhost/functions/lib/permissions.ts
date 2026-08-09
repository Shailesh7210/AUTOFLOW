import { hasuraRequest } from './hasuraClient';

export async function getUserOrgRole(userId: string, orgId: string): Promise<string | null> {
  const query = `
    query GetUserRole($userId: uuid!, $orgId: uuid!) {
      org_members(where: { user_id: { _eq: $userId }, org_id: { _eq: $orgId } }) {
        role
      }
    }
  `;

  const data = await hasuraRequest(query, { userId, orgId });
  if (data.org_members && data.org_members.length > 0) {
    return data.org_members[0].role;
  }
  return null;
}

export async function verifyRolePermission(
  userId: string,
  orgId: string,
  allowedRoles: string[]
): Promise<boolean> {
  const role = await getUserOrgRole(userId, orgId);
  return role ? allowedRoles.includes(role) : false;
}
