import { SERVER_URL } from "../../constants";
import { AuthResponse } from "../../types";

export async function Login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${SERVER_URL}api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Login failed: ${response.statusText}`);
  }

  return data;
}

export async function SignIn(username: string, password: string) {
  const response = await fetch(`${SERVER_URL}api/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Sign-up failed: ${response.statusText}`);
  }

  return data;
}

async function RefreshToken() {
  const response = await fetch(`${SERVER_URL}api/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }
  const data = await response.json();

  return data;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  body: unknown = null,
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : options.body,
    credentials: "include",
  });
  if (response.status === 401) {
    try {
      await RefreshToken();
      return await fetchWithAuth(url, options);
    } catch (error) {
      //   window.location.href = "/";
      console.error("Token refresh failed:", error);
      throw new Error("Authentication failed. Please log in again.");
    }
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }
  return response;
}
