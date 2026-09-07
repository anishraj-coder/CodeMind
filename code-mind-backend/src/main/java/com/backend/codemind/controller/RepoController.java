package com.backend.codemind.controller;

import com.backend.codemind.config.WithRateLimiter;
import com.backend.codemind.dto.GitHubRepositoryResponse;
import com.backend.codemind.dto.IndexStatusResponse;
import com.backend.codemind.entity.AppUser;
import com.backend.codemind.security.CurrentUser;
import com.backend.codemind.service.GitHubRepositoryService;
import com.backend.codemind.service.indexing.IndexingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repo")
public class RepoController {
    private final CurrentUser currentUser;
    private final GitHubRepositoryService gitHubRepositoryService;
    private final IndexingService indexingService;

    @GetMapping
    public ResponseEntity<List<GitHubRepositoryResponse>> list(@RequestParam(value = "refresh",
            defaultValue = "true",required = false)boolean refresh){
        Long userId=currentUser.require().getUser().getId();
        if(refresh){
            return ResponseEntity.status(HttpStatus.CREATED).body(gitHubRepositoryService.syncAndListRepos(userId));
        }

        return ResponseEntity.ok(gitHubRepositoryService.listSavedRepo(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GitHubRepositoryResponse> getRepo(@PathVariable("id")Long repoId){
        Long userId=currentUser.require().getUser().getId();
        return ResponseEntity.ok(gitHubRepositoryService.requireOwnedResponse(userId,repoId));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<IndexStatusResponse> status(@PathVariable("id")Long repoId){
        Long userId=currentUser.require().getUser().getId();
        return ResponseEntity.ok(gitHubRepositoryService.status(userId,repoId));
    }

    @GetMapping("/commit/{repoId}")
    public ResponseEntity<String> getLastCommit(@PathVariable("repoId")Long repoId){
        Long userId=currentUser.require().getUser().getId();
        return ResponseEntity.ok(gitHubRepositoryService.getLastCommitHash(userId,repoId));
    }

    @WithRateLimiter
    @PostMapping("/index/{repoId}")
    public ResponseEntity<GitHubRepositoryResponse> startIndexing(@PathVariable("repoId")Long repoId){
        AppUser user=currentUser.require().getUser();
        GitHubRepositoryResponse res=indexingService.startIndexing(repoId,user.getId());
        indexingService.indexAsync(repoId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}
