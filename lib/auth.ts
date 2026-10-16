import Cookies from "js-cookie";

const TOKEN_KEY = "renza_restaurant_token";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7,
  sameSite: "Lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
