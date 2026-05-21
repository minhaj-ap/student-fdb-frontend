import { SERVER_URL } from "@/constants";
import { CreateFeedbackPayload, Feedback } from "@/types";
import { fetchWithAuth } from "./auth";

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

export async function UpdateFeedbackStatus(
  id: number,
  status: Feedback["status"],
): Promise<Feedback> {
  const response = await fetchWithAuth(`${SERVER_URL}api/feedbacks/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || `Feedback update failed: ${response.statusText}`,
    );
  }

  return data;
}

export async function UpdateFeedback(
  id: number,
  feedback: CreateFeedbackPayload,
): Promise<Feedback> {
  const response = await fetchWithAuth(`${SERVER_URL}api/feedbacks/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(feedback),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || `Feedback update failed: ${response.statusText}`,
    );
  }

  return data;
}
