import { apiClient } from "@/api/client.ts";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";

export const fetchRepo = async (refresh = false) => {
    const response = await apiClient.get<GitHubRepositoryResponse[]>("/api/repo", {
        params: { refresh },
    });
    return response.data;
};

export const syncReposApi = async () => {
    return fetchRepo(true);
};