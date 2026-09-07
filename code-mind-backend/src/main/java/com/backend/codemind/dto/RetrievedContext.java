package com.backend.codemind.dto;

import java.util.List;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText
) {
}
