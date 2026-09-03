package com.backend.codemind.dto;

import com.backend.codemind.entity.enums.IndexStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record IndexStatusResponse(
        Long repositoryId,
        IndexStatus indexStatus,
        int filesTotal,
        int filesProcessed,
        int chunkCount,
        LocalDateTime indexedAt,
        String errorMessage
) {
}
