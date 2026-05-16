import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  logout,
  selectCurrentUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import {
  clearAuthLocalStorage,
  clientHasBearerToken,
} from "../lib/authLocalStorage";
import { clearLogoutCookie, hasLogoutCookie } from "../lib/logoutCookie";
import {
  getPortalLoginUrl,
  inferCurrentPortal,
  isPartnerPortalSession,
  redirectFromPortalRoleCookieIfNeeded,
  redirectToCorrectPortalIfNeeded,
} from "../lib/portalRouting";

interface ProtectedRouteProps {
  roles?: string[];
  employeePermissions?: {
    module: string;
    action: string;
  };
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  employeePermissions,
  children,
}) => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);
  const dispatch = useDispatch();

  useEffect(() => {
    const check = () => {
      if (hasLogoutCookie()) {
        clearLogoutCookie();
        clearAuthLocalStorage();
        dispatch(logout());
      }
    };
    check();
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    window.addEventListener("focus", check);
    window.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", check);
      window.removeEventListener("visibilitychange", onVisibility);
    };
  }, [dispatch]);

  const hasToken = clientHasBearerToken(token);

  if (!hasToken || !user) {
    if (hasLogoutCookie()) {
      clearLogoutCookie();
      clearAuthLocalStorage();
      dispatch(logout());
      window.location.href = getPortalLoginUrl();
      return null;
    }
    if (redirectFromPortalRoleCookieIfNeeded()) return null;
    window.location.href = getPortalLoginUrl();
    return null;
  }

  if (inferCurrentPortal() === "partner" && !isPartnerPortalSession(user)) {
    clearAuthLocalStorage();
    dispatch(logout());
    if (redirectFromPortalRoleCookieIfNeeded()) return null;
    window.location.href = getPortalLoginUrl();
    return null;
  }

  if (redirectToCorrectPortalIfNeeded(user)) {
    return null;
  }

  // Check if user has required access
  const hasAccess = checkAccess(user, roles, employeePermissions);

  if (!hasAccess) {
    return <Navigate to="/404" replace />;
  }

  // User is authenticated and has access
  return <>{children}</>;
};

// Helper function to check if user has access
const checkAccess = (
  user: any,
  roles?: string[],
  employeePermissions?: { module: string; action: string },
): boolean => {
  // If no restrictions, allow access
  if (!roles && !employeePermissions) {
    return true;
  }

  // Check if user has required role (for regular users)
  if (roles && user.type === "user") {
    return roles.includes(user.role);
  }

  // Check if user has required permissions (for employees)
  if (employeePermissions && user.type === "employee" && user.designation) {
    const { module, action } = employeePermissions;
    const modulePermission = user.designation.permissions?.find(
      (p: any) => p.module === module,
    );

    if (modulePermission && modulePermission.actions.includes(action)) {
      return true;
    }
  }

  // Allow access if user is EMPLOYEE type (for backward compatibility)
  if (roles && roles.includes("EMPLOYEE") && user.type === "employee") {
    return true;
  }

  // If user doesn't match any criteria, deny access
  return false;
};

export default ProtectedRoute;
