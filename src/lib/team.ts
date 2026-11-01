export type MemberRole = "member" | "admin" | "owner";

const hasRole = (role: string, wanted: string) => role.split(",").some((r) => r.trim() === wanted);
export const isOwnerRole = (role: string) => hasRole(role, "owner");
export const isTeamAdmin = (role: string) => isOwnerRole(role) || hasRole(role, "admin");

/**
 * What the viewer may do to a member row. This shapes the UI only; Better Auth
 * enforces the same rules on the server, including the last-owner block.
 */
export function memberControls({ viewerRole, targetRole, self, ownerCount }: { viewerRole: string; targetRole: string; self: boolean; ownerCount: number }) {
  const viewerIsOwner = isOwnerRole(viewerRole);
  const targetIsOwner = isOwnerRole(targetRole);
  const lastOwner = targetIsOwner && ownerCount <= 1;
  const manageable = isTeamAdmin(viewerRole) && !self && !lastOwner && (viewerIsOwner || !targetIsOwner);
  const roles: MemberRole[] = viewerIsOwner ? ["member", "admin", "owner"] : ["member", "admin"];
  return { manageable, roles };
}
