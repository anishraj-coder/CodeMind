// src/hooks/use-index.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { indexRepo } from "@/api";

export const useIndex = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (repoId:number) => indexRepo(repoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["repos"] });
        },
    });
};