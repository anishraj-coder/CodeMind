import { useMutation, useQueryClient } from "@tanstack/react-query";
import { indexRepo } from "@/api";
import type { GitHubRepositoryResponse } from "@/types/repo.ts";

export const useIndex = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (repoId: number) => indexRepo(repoId),
        onMutate: async (repoId: number) => {
            // Optimistically update the repo status to INDEXING
            queryClient.setQueryData<GitHubRepositoryResponse[]>(["repos"], (old) => {
                if (!old) return old;
                return old.map((repo) =>
                    repo.id === repoId ? { ...repo, indexStatus: "INDEXING" } : repo
                );
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["repos"] });
        },
    });
};