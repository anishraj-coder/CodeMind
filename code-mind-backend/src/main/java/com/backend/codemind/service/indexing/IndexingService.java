package com.backend.codemind.service.indexing;

import com.backend.codemind.dto.GitHubRepositoryResponse;
import com.backend.codemind.entity.AppUser;
import com.backend.codemind.entity.GitHubRepository;
import com.backend.codemind.entity.enums.IndexStatus;
import com.backend.codemind.exceptions.BadRequestException;
import com.backend.codemind.exceptions.NotFoundException;
import com.backend.codemind.repository.GitHubRepositoryRepository;
import com.backend.codemind.service.AppUserService;
import com.backend.codemind.service.ai.RagSettings;
import com.backend.codemind.service.api.GitHubApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndexingService {
    private static final int VECTOR_BATCH_SIZE=8;
    private static final int PROGRESS_EVERY_N_FILES=5;
    private final AppUserService userService;
    private final GitHubRepositoryRepository gitHubRepositoryRepository;
    private final CodeFileFilter codeFileFilter;
    private final CodeChunker codeChunker;
    private final GitHubApiClient apiClient;
    private final VectorStore vectorStore;


    @Value("${app.index.max-file-bytes:102400}")
    private long maxFileBytes;

    @Lazy
    @Autowired
    private IndexingService self;

    public GitHubRepositoryResponse startIndexing(Long repoId,Long userId){
        GitHubRepository repository=gitHubRepositoryRepository
                .findByUserIdAndId(userId,repoId)
                .orElseThrow(()->new NotFoundException("No repo found for user : "+userId+"  with repo Id: "+repoId));
        if(repository.getIndexStatus()== IndexStatus.INDEXING){
            throw new BadRequestException("The Indexing is already in process");
        }
        repository.setIndexStatus(IndexStatus.INDEXING);
        repository.setFilesProcessed(0);
        repository.setFilesTotal(0);
        repository.setChunkCount(0);
        repository.setErrorMessage(null);
        return mapToResponse(gitHubRepositoryRepository.save(repository));
    }

    @Async("indexingExecutor")
    public void indexAsync(Long repoId, Long userId) {
        try {
            doIndex(repoId, userId);
        } catch (Exception ex) {
            log.error("[INDEXING_FAILED]: Indexing failed for repoId {}", repoId, ex);
            self.markFailed(repoId, ex.getMessage());
        }
    }



    public void doIndex(Long repoId,Long userId){

        GitHubRepository repo=gitHubRepositoryRepository.findByUserIdAndId(userId,repoId)
                .orElseThrow(()->new NotFoundException("The given Repo is not found"));
        AppUser user=userService.getUserById(userId);
        String accessToken=userService.decryptAccessToken(user.getAccessToken());
        Map<String,Object> tree=apiClient.getRepoTree(accessToken,repo.getOwner(),
                repo.getRepositoryName(),repo.getDefaultBranch());
        deleteExistingVectors(repo.getId().toString());

        List<String>filePaths=listIndexableFiles(tree,repo);
        List<Document> batch=new ArrayList<>();
        int processed=0,totalChunks=0;
        for(String path: filePaths){
            try{
                log.info("[API_REQUEST]: Going to fetch content of the path: {}",path);
                String content=apiClient.getFileContent(accessToken,repo.getOwner(),repo.getRepositoryName(),path);
                log.info("[API_REQUEST]: Successful fetch of Content of file: {} with content size: {}",
                        path,content.length());
                List<Document>chunks=codeChunker.chunkFile(repo.getId().toString(),path,content);
                totalChunks+=chunks.size();
                batch.addAll(chunks);
                if(batch.size()>=VECTOR_BATCH_SIZE){
                    log.info("[VECTORIZING]: Vectorizing the batch of size{}",batch.size());
                    vectorStore.add(batch);
                    log.info("[VECTORIZING]: Vectorizing Successful for the batch of size{}",batch.size());
                    batch.clear();
                }
            }catch (Exception ex) {
                log.warn("[CHUNKING]: Failed processing file {} in repo {}: {}", path, repo.getFullName(), ex.getMessage());
            }
            processed++;
            if(processed%PROGRESS_EVERY_N_FILES==0||processed==filePaths.size()){
                self.updateProgress(repo.getId(), processed, filePaths.size(), totalChunks, IndexStatus.INDEXING, null);
            }
        }
        if(!batch.isEmpty()){
            vectorStore.add(batch);
            log.info("[VECTORIZING]: Vectorizing Successful for the batch of remaining size{}",batch.size());

        }
        self.markCompletion(repo.getId(),processed, filePaths.size(), totalChunks);
        log.info("[VECTORIZING]: Vectorization of {} is now complete",repo.getFullName());
    }

    @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(Map<String, Object> treeResponse,GitHubRepository repo) {
        if(treeResponse==null||treeResponse.isEmpty())return List.of();
        List<Map<String,Object>> items=(List<Map<String,Object>>)treeResponse.get("tree");
        if(items==null||items.isEmpty())return List.of();
        List<String>indexablePaths=new ArrayList<>();
        for(Map<String,Object>item:items){
            String type=String.valueOf(item.get("type"));
            if(!"blob".equalsIgnoreCase(type))continue;
            String path=String.valueOf(item.get("path"));
            long sizeBytes=0L;
            if(item.get("size") instanceof Number number){
                sizeBytes=number.longValue();
            }
            if(codeFileFilter.isEligible(path,sizeBytes,maxFileBytes)){
                indexablePaths.add(path);
            }
        }
        return indexablePaths;
    }


    @Transactional
    public void updateProgress(Long repoId, int processed, int total, int chunks, IndexStatus status, String error) {
        gitHubRepositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setErrorMessage(error);
            repo.setIndexStatus(status);
            repo.setFilesProcessed(processed);
            repo.setFilesTotal(total);
            repo.setChunkCount(chunks);
            gitHubRepositoryRepository.save(repo);
        });
    }

    @Transactional
    public void markCompletion(Long repoId,int processed,int total,int chunks){
        gitHubRepositoryRepository.findById(repoId).ifPresent(repo->{
            repo.setIndexStatus(IndexStatus.READY);
            repo.setFilesProcessed(processed);
            repo.setFilesTotal(total);
            repo.setChunkCount(chunks);
            repo.setErrorMessage(null);
            repo.setIndexedAt(LocalDateTime.now());
            gitHubRepositoryRepository.save(repo);
        });
    }

    @Transactional
    public void markFailed(Long repoId, String message) {
        gitHubRepositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexStatus(IndexStatus.FAILED);
            repo.setErrorMessage(message != null && message.length() > 2000
                    ? message.substring(0, 2000)
                    : message);
            gitHubRepositoryRepository.save(repo);
        });
    }

    private void deleteExistingVectors(String repoId){
        try{
            log.info("[VECTORIZING]: Deleting old vectors for repo ID: {}",repoId);
            var filter = new FilterExpressionBuilder().eq(RagSettings.METADATA_REPO_ID, repoId).build();
            log.info("[VECTORIZING]: Successfully deleted old vectors for repo ID: {}",repoId);
            vectorStore.delete(filter);
        }catch (Exception _){
            log.warn("[DELETING_VECTORS]: Error occurred while deleting existing vectors repoId: {}",repoId);
        }
    }

    private static GitHubRepositoryResponse mapToResponse(GitHubRepository repo){
        return GitHubRepositoryResponse.builder()
                .id(repo.getId())
                .githubRepoId(repo.getGithubRepoId())
                .owner(repo.getOwner())
                .name(repo.getRepositoryName())
                .fullName(repo.getFullName())
                .isPrivate(repo.isPrivate())
                .language(repo.getLanguage())
                .defaultBranch(repo.getDefaultBranch())
                .htmlUrl(repo.getHtmlUrl())
                .description(repo.getDescription())
                .indexStatus(repo.getIndexStatus())
                .indexedAt(null)
                .chunkCount(0)
                .filesProcessed(0)
                .filesTotal(0)
                .errorMessage(null)
                .lastCommitHash(repo.getLastCommitHash())
                .build();
    }
}
