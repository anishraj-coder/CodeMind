import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";
import { fetchRepo, fetchSingleRepo, syncReposApi, deleteRepoIndexApi } from "@/api/repo.ts";

export const useRepo = () => {
    return useQuery<GitHubRepositoryResponse[]>({
        queryKey: ["repos"],
        queryFn: () => fetchRepo(false),
        staleTime: 1000 * 60 * 5,
        refetchInterval: (query) => {
            const data = query.state.data;
            const isAnyIndexing = data?.some((repo) => repo.indexStatus === "INDEXING");
            return isAnyIndexing ? 2000 : false;
        },
    });
};

export const useSingleRepo = (repoId: number) => {
    return useQuery<GitHubRepositoryResponse>({
        queryKey: ["repo", repoId],
        queryFn: () => fetchSingleRepo(repoId),
        enabled: Boolean(repoId) && repoId > 0,
        staleTime: 1000 * 60 * 5,
    });
};

export const useSyncRepos = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: syncReposApi,
        onSuccess: (data) => {
            queryClient.setQueryData(["repos"], data);
        },
    });
};

export const useDeleteRepoIndex = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (repoId: number) => deleteRepoIndexApi(repoId),
        onSuccess: (_, repoId) => {
            queryClient.invalidateQueries({ queryKey: ["repos"] });
            queryClient.invalidateQueries({ queryKey: ["repo", repoId] });
            queryClient.invalidateQueries({ queryKey: ["repo-status", repoId] });
            queryClient.invalidateQueries({ queryKey: ["chat-sessions", repoId] });
        },
    });
};