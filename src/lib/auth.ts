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

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();

  return data;
}
