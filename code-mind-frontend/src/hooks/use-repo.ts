import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";
import { fetchRepo, syncReposApi } from "@/api/repo.ts";

export const useRepo = () => {
    return useQuery<GitHubRepositoryResponse[]>({
        queryKey: ["repos"],
        queryFn: () => fetchRepo(false),
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