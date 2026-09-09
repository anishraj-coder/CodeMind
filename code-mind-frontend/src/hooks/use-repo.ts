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
        onMutate: async (repoId: number) => {
            await queryClient.cancelQueries({ queryKey: ["repos"] });
            const previousRepos = queryClient.getQueryData<GitHubRepositoryResponse[]>(["repos"]);

            if (previousRepos) {
                queryClient.setQueryData<GitHubRepositoryResponse[]>(
                    ["repos"],
                    previousRepos.map((r) =>
                        r.id === repoId
                            ? {
                                  ...r,
                                  indexStatus: "PENDING",
                                  chunkCount: 0,
                                  filesProcessed: 0,
                                  filesTotal: 0,
                                  indexedAt: null,
                                  errorMessage: null,
                              }
                            : r
                    )
                );
            }

            // Remove stale status query data
            queryClient.removeQueries({ queryKey: ["repo-status", repoId] });

            return { previousRepos };
        },
        onError: (_err, _repoId, context) => {
            if (context?.previousRepos) {
                queryClient.setQueryData(["repos"], context.previousRepos);
            }
        },
        onSettled: (_, __, repoId) => {
            queryClient.invalidateQueries({ queryKey: ["repos"] });
            queryClient.invalidateQueries({ queryKey: ["repo", repoId] });
            queryClient.invalidateQueries({ queryKey: ["chat-sessions", repoId] });
        },
    });
};