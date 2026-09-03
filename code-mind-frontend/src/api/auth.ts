import { apiClient, API_BASE_URL } from "./client";
import type { UserResponse } from "@/types/auth";

export async function getCurrentUser(): Promise<UserResponse | null> {
  try {
    const response = await apiClient.get<UserResponse>("/api/auth/me");
    return response.data;
  } catch {
    return null;
  }
}

export async function getLoginUrl(): Promise<string> {
  try {
    const response = await apiClient.get<{ url: string }>("/api/auth/login-url");
    const relativeOrAbsoluteUrl = response.data?.url || "/oauth2/authorization/github";
    if (relativeOrAbsoluteUrl.startsWith("http")) {
      return relativeOrAbsoluteUrl;
    }
    return `${API_BASE_URL}${relativeOrAbsoluteUrl}`;
  } catch {
    return `${API_BASE_URL}/oauth2/authorization/github`;
  }
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}
