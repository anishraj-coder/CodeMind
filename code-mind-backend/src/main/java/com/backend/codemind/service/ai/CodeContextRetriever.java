package com.backend.codemind.service.ai;

import com.backend.codemind.dto.RetrievedContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class CodeContextRetriever {
    private final VectorStore vectorStore;
    private final CitationMapper citationMapper;
    private static final String NO_MATCH="(no matching code chunks found)";

    public RetrievedContext retrieve(Long repoId,String question){
        log.info("[CODE CONTEXT RETRIEVER]: Retrieving context for Repoid: {} for question:\n {}",repoId,question);
        var filter=new FilterExpressionBuilder().eq(RagSettings.METADATA_REPO_ID,repoId.toString()).build();
        var searchRequest= SearchRequest.builder()
                .query(question)
                .topK(RagSettings.TOP_K_CHUNKS)
                .filterExpression(filter)
                .build();
        List<Document> documents=vectorStore.similaritySearch(searchRequest);

        log.info("[CODE CONTEXT RETRIEVER]: Found context of Length : {}",documents.size());

        var citations= documents.stream()
                .distinct()
                .map(citationMapper::fromDocument)
                .toList();
        var contextText = documents.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        if (contextText.isBlank()) {
            contextText = NO_MATCH;
        }

        return new RetrievedContext(citations,contextText);
    }

}
