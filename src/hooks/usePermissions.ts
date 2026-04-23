import { useSelector } from "react-redux";
import { RootState } from "@/redux";

export const usePermissions = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const permissions = user?.permissions || [];
  const userRole = user?.role || "";

  const isReady = !loading;

  const hasPermission = (permission: string): boolean => {
    if (!isReady) return false; // 🔥 tránh check sớm
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!isReady) return false;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (!isReady) return false;
    return requiredPermissions.every((perm) => permissions.includes(perm));
  };

  return {
    user,
    permissions,
    userRole,
    isReady, // 👈 thêm vào đây
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: permissions.includes("admin:manage"),
  };
};
