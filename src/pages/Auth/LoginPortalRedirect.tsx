import { useLayoutEffect } from "react";
import { config } from "../../config";
import { getPortalLoginUrl, isOnPrimaryAppDomain } from "../../lib/portalRouting";
import Login from "./Login";

export default function LoginPortalRedirect() {
  // Only redirect to the centralized login hub when actually on the primary
  // app domain. On standalone deployments (e.g. *.vercel.app) or localhost,
  // render this deployment's own login page instead of redirecting.
  const shouldRedirect =
    config.node_env === "production" && isOnPrimaryAppDomain();
  const loginHref = shouldRedirect ? getPortalLoginUrl() : "";

  useLayoutEffect(() => {
    if (!shouldRedirect || typeof window === "undefined") return;
    window.location.replace(loginHref);
  }, [loginHref, shouldRedirect]);

  if (!shouldRedirect) {
    return <Login />;
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="text-base font-medium text-gray-800">
        Redirecting to login...
      </p>
      <p className="text-sm text-gray-500">
        If you are not redirected,{" "}
        <a href={loginHref} className="text-primary-600 underline">
          continue here
        </a>
        .
      </p>
    </div>
  );
}
