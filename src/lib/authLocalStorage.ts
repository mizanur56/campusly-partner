/** Keep in sync with login / session restore; baseApi logout clears these keys. */
export function persistAuthLocalStorage(user: unknown, token: string): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthLocalStorage(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
