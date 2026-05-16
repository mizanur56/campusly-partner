/** True if Redux or legacy `token` key has a non-empty bearer (avoid false logouts when only one is in sync). */
export function clientHasBearerToken(
  reduxToken: string | null | undefined,
): boolean {
  const t = reduxToken?.trim();
  if (t) return true;
  return Boolean(localStorage.getItem("token")?.trim());
}

/** Keep in sync with login / session restore; baseApi logout clears these keys. */
export function persistAuthLocalStorage(user: unknown, token: string): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthLocalStorage(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("persist:auth");
}
