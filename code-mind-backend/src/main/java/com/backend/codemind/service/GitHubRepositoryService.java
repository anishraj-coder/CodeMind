package com.backend.codemind.service;

import com.backend.codemind.dto.GitHubRepositoryResponse;
import com.backend.codemind.dto.IndexStatusResponse;
import com.backend.codemind.entity.AppUser;
import com.backend.codemind.entity.GitHubRepository;
import com.backend.codemind.entity.enums.IndexStatus;
import com.backend.codemind.exceptions.NotFoundException;
import com.backend.codemind.repository.GitHubRepositoryRepository;
import com.backend.codemind.service.api.GitHubApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubRepositoryService {
    private final GitHubApiClient gitHubApiClient;
    private final GitHubRepositoryRepository repositoryRepository;
    private final AppUserService userService;

    private static Long toLong(Object value){

        if(value instanceof Number number){
            return number.longValue();
        }

        return Long.parseLong(String.valueOf(value));
    }


    @Transactional
    public List<GitHubRepositoryResponse> syncAndListRepos(Long userId){
        AppUser user=userService.getUserById(userId);
        String accessToken=userService.decryptAccessToken(user);
        List<Map<String,Object>> remoteRepos=gitHubApiClient.listUserRepo(accessToken);
        List<GitHubRepository>saved=new ArrayList<>();
        for(Map<String, Object>remoteRepo:remoteRepos){
            Long githubRepoId= GitHubRepositoryService.toLong(remoteRepo.get("id"));
            GitHubRepository repo=repositoryRepository.findByUserIdAndGithubRepoId(user.getId(),githubRepoId)
                    .orElseGet(GitHubRepository::new);
            String fullName=String.valueOf(remoteRepo.get("full_name"));
            String[]parts=fullName.split("/",2);
            repo.setUserId(userId);
            repo.setGithubRepoId(githubRepoId);
            repo.setOwner(parts.length>0?parts[0]: String.valueOf(remoteRepo.get("owner")));
            repo.setRepositoryName(parts.length>1?parts[1]:String.valueOf(remoteRepo.get("name")));
            repo.setFullName(fullName);
            repo.setPrivate(Boolean.TRUE.equals(remoteRepo.get("private")));
            repo.setDefaultBranch(remoteRepo.get("default_branch")!=null?
                    String.valueOf(remoteRepo.get("default_branch")):"main");
            repo.setLanguage(remoteRepo.get("language")!=null?
                    String.valueOf(remoteRepo.get("language")):null);
            repo.setHtmlUrl(remoteRepo.get("html_url")!=null?
                    String.valueOf(remoteRepo.get("html_url")):null);
            String description=remoteRepo.get("description")!=null?String.valueOf(remoteRepo.get("description")):null;
            if(description!=null&&description.length()>200){
                description=description.substring(0,200);
            }
            repo.setDescription(description);
            String lastCommitHash=this.getLastCommitHash(accessToken,repo.getOwner(),repo.getRepositoryName());
            if(repo.getIndexStatus()!=null&&repo.getIndexStatus()==IndexStatus.READY
                    &&!repo.getLastCommitHash().equals(lastCommitHash)){
                repo.setIndexStatus(IndexStatus.STALE);
            }else if(repo.getIndexStatus()==null) {
                repo.setIndexStatus(IndexStatus.PENDING);
            }
            repo.setLastCommitHash(lastCommitHash);

            saved.add(repositoryRepository.save(repo));
        }
        return saved.stream().map(GitHubRepositoryService::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<GitHubRepositoryResponse> listSavedRepo(Long userId){
        return repositoryRepository.findAllByUserIdOrderByFullNameAsc(userId)
                .stream().map(GitHubRepositoryService::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public GitHubRepository requireOwned(Long userId,Long repoId){
        return repositoryRepository.findByUserIdAndId(userId,repoId)
                .orElseThrow(()-> new NotFoundException("Provided repo is not found"));
    }

    @Transactional(readOnly = true)
    public GitHubRepositoryResponse requireOwnedResponse(Long userId,Long repoId){
        return GitHubRepositoryService.mapToResponse(this.requireOwned(userId,repoId));
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse  status(Long userId,Long repoId){
        return GitHubRepositoryService.mapToIndexStatus(this.requireOwned(userId,repoId));
    }


    @Transactional(readOnly = true)
    public String getLastCommitHash(Long userId,Long repoId){
        AppUser user=userService.getUserById(userId);
        String accessToken=userService.decryptAccessToken(user);
        GitHubRepository repository=repositoryRepository.findByUserIdAndId(user.getId(),repoId)
                .orElseThrow(()->new NotFoundException("Repository Not found"));
        List<Map<String,Object>>commits=gitHubApiClient.getCommits(accessToken,
                repository.getOwner(),repository.getRepositoryName());
        return getLastCommitHash(accessToken,repository.getOwner(),repository.getRepositoryName());
    }


    private String getLastCommitHash(String accessToken,String owner,String name){
        List<Map<String,Object>>commits=gitHubApiClient.getCommits(accessToken,owner,name);
        if(commits.isEmpty())return "No commit";
        Map<String,Object>lastCommit=commits.getFirst();
        if(lastCommit==null||lastCommit.isEmpty())return "No commit";
        return lastCommit.get("sha")!=null?String.valueOf(lastCommit.get("sha")):"No commit";
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
                .indexedAt(repo.getIndexedAt())
                .chunkCount(repo.getChunkCount())
                .filesProcessed(repo.getFilesProcessed())
                .filesTotal(repo.getFilesTotal())
                .errorMessage(repo.getErrorMessage())
                .lastCommitHash(repo.getLastCommitHash())
                .build();
    }

    private  static IndexStatusResponse mapToIndexStatus(GitHubRepository repo){
        return IndexStatusResponse.builder()
                .repositoryId(repo.getId())
                .indexStatus(repo.getIndexStatus())
                .indexedAt(repo.getIndexedAt())
                .filesTotal(repo.getFilesTotal())
                .filesProcessed(repo.getFilesProcessed())
                .chunkCount(repo.getChunkCount())
                .errorMessage(repo.getErrorMessage())
                .build();
    }
}
