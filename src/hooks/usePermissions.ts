import { useSelector } from "react-redux";
import { RootState } from "@/redux";

export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const permissions = user?.permissions || [];
  const userRole = user?.role || "";

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the listed permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  /**
   * Check if user has all of the listed permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  return {
    user,
    permissions,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: permissions.includes("admin:manage"),
  };
};
