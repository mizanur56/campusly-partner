import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectCurrentUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import { clearAuthLocalStorage } from "../lib/authLocalStorage";
import {
  getPortalLoginUrl,
  inferCurrentPortal,
  isPartnerPortalSession,
  redirectToCorrectPortalIfNeeded,
} from "../lib/portalRouting";

/**
 * Guest-only auth screens — logged-in users go to dashboard home.
 */
export default function GuestOnlyAuthRoute({
  children,
}: {
  children: ReactNode;
}) {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);
  const dispatch = useDispatch();

  const hasToken = Boolean(token && localStorage.getItem("token"));
  const authed = Boolean(user && hasToken);

  if (!authed) {
    return <>{children}</>;
  }

  if (
    inferCurrentPortal() === "partner" &&
    !isPartnerPortalSession(user)
  ) {
    clearAuthLocalStorage();
    dispatch(logout());
    window.location.replace(getPortalLoginUrl());
    return null;
  }

  if (redirectToCorrectPortalIfNeeded(user)) {
    return null;
  }

  return <Navigate to="/" replace />;
}
