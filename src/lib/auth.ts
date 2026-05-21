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
