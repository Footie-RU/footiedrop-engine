import { ForbiddenException } from '@nestjs/common';

/**
 * Checks if the admin has the required permission.
 * @param permissionString - Comma-separated string of permissions, e.g., "1,0,1,0".
 * @param permissionIndex - Index of the permission to check (0 for create, 1 for read, etc.).
 * @param action - Action name for error messages (e.g., "create", "read", "update", "delete").
 */
export function checkPermission(
  permissionString: string,
  permissionIndex: 0 | 1 | 2 | 3,
  action: 'create' | 'read' | 'update' | 'delete',
): void {
  const permissions = permissionString.split(',').map(Number);

  if (permissions[permissionIndex] !== 1) {
    throw new ForbiddenException(`You do not have ${action} permissions!`);
  }
}
