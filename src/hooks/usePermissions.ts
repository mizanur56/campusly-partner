import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/features/auth/authSlice";

export const usePermissions = () => {
  const user = useSelector(selectCurrentUser);

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user) {
        return false;
      }

      // Regular users have access based on their role
      if (user.type === "user") {
        // Define role-based permissions - match backend role names exactly
        const rolePermissions: Record<string, string[]> = {
          SUPER_ADMIN: ["*"], // Super Admin has all permissions
          ADMIN: ["*"], // Admin has all permissions
          USER: ["read"],
        };

        const userPermissions = rolePermissions[user.role] || [];
        return (
          userPermissions.includes("*") || userPermissions.includes(action)
        );
      }

      // Employees have permissions based on their designation
      if (user.type === "employee" && user.designation?.permissions) {
        const modulePermission = user.designation.permissions.find(
          (p: any) => p.module.toLowerCase() === module.toLowerCase()
        );

        if (modulePermission && modulePermission.actions.includes(action)) {
          return true;
        }
      }

      return false;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;

      if (user.type === "user") {
        // Case-insensitive role matching
        return roles.some(
          (role) => role.toUpperCase() === user.role.toUpperCase()
        );
      }

      // For employees, check if they have the EMPLOYEE role or specific permissions
      if (user.type === "employee") {
        return roles.some((role) => role.toUpperCase() === "EMPLOYEE");
      }

      return false;
    },
    [user]
  );

  const hasAnyPermission = (
    permissions: Array<{ module: string; action: string }>
  ): boolean => {
    return permissions.some((permission) =>
      hasPermission(permission.module, permission.action)
    );
  };

  const isEmployee = (): boolean => {
    return user?.type === "employee";
  };

  const isUser = (): boolean => {
    return user?.type === "user";
  };

  const getUserType = (): "user" | "employee" | null => {
    return user?.type || null;
  };

  const canAccessModule = (module: string): boolean => {
    if (!user) return false;

    // Super admin and admin can access everything
    if (user.type === "user" && ["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return true;
    }

    // Check employee permissions
    if (user.type === "employee" && user.designation?.permissions) {
      return user.designation.permissions.some(
        (p: any) => p.module.toLowerCase() === module.toLowerCase()
      );
    }

    return false;
  };

  return {
    user,
    hasPermission,
    hasRole,
    hasAnyPermission,
    isEmployee,
    isUser,
    getUserType,
    canAccessModule,
  };
};
