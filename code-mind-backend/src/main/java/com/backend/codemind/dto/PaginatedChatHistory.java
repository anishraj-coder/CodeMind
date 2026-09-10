package com.backend.codemind.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record PaginatedChatHistory(
        List<ChatMessageResponse> messages,
        PaginationMeta pagination
) {
}
