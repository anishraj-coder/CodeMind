package com.backend.codemind.dto;

public record ChatRequest(
        Long repoId,
        String repositoryFullName,
        String question
) {}