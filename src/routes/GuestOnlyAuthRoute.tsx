import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { POST_REGISTER_WELCOME_FLAG } from "../lib/registrationWelcomeSession";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  selectCurrentUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import {
  clearAuthLocalStorage,
  clientHasBearerToken,
} from "../lib/authLocalStorage";
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
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(useCurrentToken);
  const dispatch = useDispatch();

  const hasToken = clientHasBearerToken(token);
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

  const path =
    location.pathname.length > 1
      ? location.pathname.replace(/\/$/, "")
      : location.pathname;

  if (
    path === "/register" &&
    sessionStorage.getItem(POST_REGISTER_WELCOME_FLAG) === "1"
  ) {
    /* Do not remove flag here — React Strict Mode double-mount would clear it and
       send users to "/" before the second pass. Clear on RegistrationWelcomePage mount. */
    return <Navigate to="/register/welcome" replace />;
  }

  return <Navigate to="/" replace />;
}
