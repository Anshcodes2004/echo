const API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const TOKEN_KEY = "echo_auth_token";

export type User = { id: string; email: string; name?: string };

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function authFetch(input: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers as HeadersInit);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(API + input, { ...init, headers });
  if (res.status === 401) {
    clearToken();
  }
  return res;
}

export async function signIn(email: string, password: string): Promise<User> {
  const res = await fetch(API + "/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Sign in failed");
  const data = await res.json();
  if (data.token) setToken(data.token);
  return data.user as User;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(API + "/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw new Error("Sign up failed");
  const data = await res.json();
  if (data.token) setToken(data.token);
  return data.user as User;
}

export async function fetchMe(): Promise<User | null> {
  const res = await authFetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Could not fetch user");
  const data = await res.json();
  // backend may return either `{ user: {...} }` or the user object directly
  return (data?.user ?? data) as User;
}
