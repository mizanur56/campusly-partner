import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { usePermissions } from "./usePermissions";

/**
 * Complete Frontend Route to Permission Mapping
 * Based on your actual backend routes
 */
const routePermissions: Record<string, { module: string; action: string }> = {
  // Dashboard
  "/": { module: "Dashboard", action: "view" },

  // ==================== EMPLOYEES & DESIGNATIONS ====================
  "/employees": { module: "Employees", action: "view" },
  "/employee/:id": { module: "Employees", action: "view" },
  "/create-employee": { module: "Employees", action: "create" },
  "/employee/update/:id": { module: "Employees", action: "update" },

  "/designations": { module: "Designations", action: "view" },
  "/designation/:id": { module: "Designations", action: "view" },
  "/create-designation": { module: "Designations", action: "create" },
  "/designation/update/:id": { module: "Designations", action: "update" },

  // ==================== SETTINGS ====================
  "/media": { module: "Media Library", action: "view" },
};

/**
 * Match dynamic route patterns like /product/:id with actual paths like /product/123
 */
const matchRoute = (pathname: string, routePattern: string): boolean => {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = routePattern.split("/").filter(Boolean);

  if (pathParts.length !== patternParts.length) return false;

  return patternParts.every((part, i) => {
    // Match dynamic segments (:id, :productId, etc.) or exact matches
    return part.startsWith(":") || part === pathParts[i];
  });
};

/**
 * Get permission requirement for a given route path
 */
const getRoutePermission = (
  pathname: string
): { module: string; action: string } | null => {
  // Remove trailing slash for consistency
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;

  // Try exact match first
  if (routePermissions[normalizedPath]) {
    return routePermissions[normalizedPath];
  }

  // Try pattern matching for dynamic routes
  for (const [pattern, permission] of Object.entries(routePermissions)) {
    if (matchRoute(normalizedPath, pattern)) {
      return permission;
    }
  }

  return null;
};

/**
 * Hook to automatically check route permissions
 * Add this to your MainLayout component
 */
export const useRoutePermission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, user } = usePermissions();

  useEffect(() => {
    // Public/debug routes that don't require permission checks
    const publicRoutes = [
      "/login",
      "/403",
      "/404",
      "/permission-debug",
      "/forgot-password",
      "/reset-password",
    ];
    if (publicRoutes.includes(location.pathname)) {
      return;
    }

    // Skip check if user is not loaded yet
    if (!user) {
      return;
    }

    const requirement = getRoutePermission(location.pathname);

    // If no requirement found, allow access (public routes or routes not in mapping)
    if (!requirement) {
      return;
    }

    // Super Admin and Admin bypass all checks
    if (user.type === "user" && ["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
      return;
    }

    // Check if user has required permission
    const hasAccess = hasPermission(requirement.module, requirement.action);

    if (!hasAccess) {
      console.warn(
        `🚫 Access denied to ${location.pathname}: Missing "${requirement.action}" permission for "${requirement.module}"`
      );
      navigate("/403", { replace: true });
    } else {
      console.log(`✅ Access granted to ${location.pathname}`);
    }
  }, [location.pathname, hasPermission, user, navigate]);

  return {
    /**
     * Manually check if a route is accessible
     * Useful for conditionally rendering navigation links
     */
    checkRouteAccess: (path: string): boolean => {
      const requirement = getRoutePermission(path);
      if (!requirement) return true;

      if (
        user?.type === "user" &&
        ["SUPER_ADMIN", "ADMIN"].includes(user.role)
      ) {
        return true;
      }

      return hasPermission(requirement.module, requirement.action);
    },

    /**
     * Get the permission requirement for a route
     */
    getRoutePermission,
  };
};
