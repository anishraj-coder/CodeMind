package com.backend.codemind.dto;

import com.backend.codemind.entity.enums.IndexStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record GitHubRepositoryResponse(
        Long id,
        Long githubRepoId,
        String owner,
        String name,
        String fullName,
        @JsonProperty("isPrivate") boolean isPrivate,
        String defaultBranch,
        String language,
        String htmlUrl,
        String description,
        IndexStatus indexStatus,
        LocalDateTime indexedAt,
        int chunkCount,
        int filesTotal,
        int filesProcessed,
        String errorMessage,
        String lastCommitHash
) {
}
