import { apiClient } from "@/api/client.ts";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";

export const indexRepo = async (repoId: number) => {
  const data = await apiClient.post<GitHubRepositoryResponse>(`/api/repo/index/${repoId}`);
  return data.data;
};

export * from "./auth.ts";
export * from "./repo.ts";
export * from "./chat.ts";