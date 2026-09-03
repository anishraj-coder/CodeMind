package com.backend.codemind.repository;

import com.backend.codemind.entity.GitHubRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GitHubRepositoryRepository extends JpaRepository<GitHubRepository, Long> {

    List<GitHubRepository> findAllByUserIdOrderByFullNameAsc(Long id);
    Optional<GitHubRepository> findByUserIdAndId(Long userId,Long id);
    Optional<GitHubRepository> findByUserIdAndGithubRepoId(Long id,Long repoId);
}