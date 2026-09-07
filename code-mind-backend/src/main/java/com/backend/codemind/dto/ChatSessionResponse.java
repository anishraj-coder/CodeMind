package com.backend.codemind.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ChatSessionResponse(
        UUID sessionId,
        String sessionTitle,
        Long messages
) {
}
