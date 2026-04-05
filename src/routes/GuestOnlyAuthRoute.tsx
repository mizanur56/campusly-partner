import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import { redirectToCorrectPortalIfNeeded } from "../lib/portalRouting";

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

  const hasToken = Boolean(token && localStorage.getItem("token"));
  const authed = Boolean(user && hasToken);

  if (!authed) {
    return <>{children}</>;
  }

  if (redirectToCorrectPortalIfNeeded(user)) {
    return null;
  }

  return <Navigate to="/" replace />;
}
