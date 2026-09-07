package com.backend.codemind.dto;

import lombok.Builder;

@Builder
public record CitationDto(
        String filePath,
        Integer startLine,
        Integer endLine,
        String language
) {
}
