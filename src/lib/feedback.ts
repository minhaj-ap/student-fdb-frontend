import { SERVER_URL } from "@/constants";
import { CreateFeedbackPayload, Feedback } from "@/types";

export async function GetFeedback(): Promise<Feedback[]> {
  const response = await fetchWithAuth(`${SERVER_URL}api/feedbacks/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Feedback failed: ${response.statusText}`);
  }

  return Array.isArray(data) ? data : data.results;
}

export async function CreateFeedback(
  feedback: CreateFeedbackPayload,
): Promise<Feedback> {
  const response = await fetchWithAuth(`${SERVER_URL}api/feedbacks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(feedback),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || `Feedback creation failed: ${response.statusText}`,
    );
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
  body: any = null,
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
