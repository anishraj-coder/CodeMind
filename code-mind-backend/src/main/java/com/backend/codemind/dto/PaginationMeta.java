package com.backend.codemind.dto;

import lombok.Builder;

@Builder
public record PaginationMeta(
        String nextKey,
        boolean hasMore
) {
}
