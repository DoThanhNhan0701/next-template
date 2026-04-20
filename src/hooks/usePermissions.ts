import { useSelector } from "react-redux";
import { RootState } from "@/redux";

export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const permissions = user?.permissions || [];
  const userRole = user?.role || "";

  // Consider user as admin if they have the "admin:manage" permission
  const isAdmin = permissions.includes("admin:manage");

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the listed permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (isAdmin) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  /**
   * Check if user has all of the listed permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (isAdmin) return true;
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  return {
    user,
    permissions,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: isAdmin,
  };
};
