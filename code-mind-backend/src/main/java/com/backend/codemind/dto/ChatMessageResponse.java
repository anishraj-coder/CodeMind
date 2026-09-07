package com.backend.codemind.dto;

import com.backend.codemind.entity.enums.MessageRole;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record ChatMessageResponse(
        UUID id,
        MessageRole role,
        String content,
        List<CitationDto> citations,
        LocalDateTime createdAt
) {}