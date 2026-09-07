package com.backend.codemind.service.indexing;

import com.backend.codemind.service.ai.RagSettings;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CodeChunker {

    private final TokenTextSplitter tokenTextSplitter;
    private final CodeFileFilter codeFileFilter;

    public CodeChunker(@Value("${app.index.chunk-size:800}") int chunkSize, CodeFileFilter codeFileFilter) {
        int chunkToken = Math.max(50, chunkSize / 4);
        this.tokenTextSplitter = TokenTextSplitter.builder()
                .withChunkSize(chunkToken)
                .build();
        this.codeFileFilter = codeFileFilter;
    }

    public List<Document> chunkFile(String repoId,String filePath,String content){
        if(!StringUtils.hasText(content))return List.of();
        String language=codeFileFilter.detectLanguage(filePath);
        int[]lineStartIdx=computeLineStartIndex(content);
        Document source=new Document(content.trim());
        List<Document> rawChunks=tokenTextSplitter.apply(List.of(source));
        List<Document> resultChunks=new ArrayList<>();
        int searchCursor=0;

        for(int i=0;i<rawChunks.size();i++){
            String chunkText=rawChunks.get(i).getText();
            String trimmedText=chunkText.trim();
            int startLine=1,endLine=1;
            if(StringUtils.hasText(trimmedText)){
                int matchedIdx=content.lastIndexOf(trimmedText,searchCursor);
                if(matchedIdx==-1){
                    matchedIdx=content.indexOf(trimmedText);
                }
                if(matchedIdx!=-1){
                    startLine=getLineNumber(lineStartIdx,matchedIdx);
                    int endChatIdx=matchedIdx+trimmedText.length();
                    endLine=getLineNumber(lineStartIdx,Math.max(endChatIdx-1,matchedIdx));
                    searchCursor=endChatIdx;
                }
                String formattedChunk = "// File: " + filePath + "\n" + chunkText;
                resultChunks.add(createChunkDocument(formattedChunk, repoId, filePath, language,
                        i, startLine, endLine));
            }
        }
        return resultChunks;
    }

    private int getLineNumber(int[] lineStartIndices, int charIndex) {
        int low = 0;
        int high = lineStartIndices.length - 1;

        while (low <= high) {
            int mid = (low + high) >>> 1;
            if (lineStartIndices[mid] <= charIndex) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return high + 1;
    }

    private int[] computeLineStartIndex(String content){
        content=content.trim();
        List<Integer>start=new ArrayList<>();
        start.add(0);
        for(int i=0;i<content.length();i++){
            if(content.charAt(i)=='\n')start.add(i+1);
        }
        return start.stream().mapToInt(Integer::intValue).toArray();
    }

    private static Map<String,Object> baseMetadata(String repoId,String filePath,String language){
        Map<String,Object>metadata=new HashMap<>();
        metadata.put(RagSettings.METADATA_REPO_ID,repoId);
        metadata.put(RagSettings.FILE_PATH,filePath);
        metadata.put(RagSettings.LANGUAGE,language);
        return metadata;
    }

    private Document createChunkDocument(String text, String repoId, String filePath, String language,
                                         int chunkIdx, int startLine, int endLine) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put(RagSettings.METADATA_REPO_ID, repoId);
        metadata.put(RagSettings.FILE_PATH, filePath);
        metadata.put(RagSettings.LANGUAGE, language);
        metadata.put(RagSettings.START_LINE, startLine);
        metadata.put(RagSettings.END_LINE, endLine);
        metadata.put("chunk_index", chunkIdx);
        return new Document(text, metadata);
    }


}
