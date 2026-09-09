import { apiClient } from "@/api/client.ts";
import type { GitHubRepositoryResponse, IndexStatusResponse } from "@/types/repo.ts";

export const fetchRepo = async (refresh = false) => {
    const response = await apiClient.get<GitHubRepositoryResponse[]>("/api/repo", {
        params: { refresh },
    });
    return response.data;
};

export const fetchSingleRepo = async (repoId: number) => {
    const response = await apiClient.get<GitHubRepositoryResponse>(`/api/repo/${repoId}`);
    return response.data;
};

export const syncReposApi = async () => {
    return fetchRepo(true);
};

export const fetchRepoStatus = async (repoId: number) => {
    const response = await apiClient.get<IndexStatusResponse>(`/api/repo/${repoId}/status`);
    return response.data;
};

export const deleteRepoIndexApi = async (repoId: number) => {
    await apiClient.delete(`/api/repo/${repoId}`);
};