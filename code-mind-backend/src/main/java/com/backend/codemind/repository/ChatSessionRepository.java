package com.backend.codemind.repository;

import com.backend.codemind.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatSessionRepository extends JpaRepository<ChatSession, UUID> {

    List<ChatSession> findAllByUserIdAndRepoIdOrderByCreatedAtDesc(Long userId,Long repoId);
    int countAllByUserIdAndRepoId(Long userId,Long repoId);
    Optional<ChatSession> findFirstByUserIdAndRepoIdOrderByCreatedAtAsc(Long userId,Long repoId);
    int deleteAllByRepoId(Long repoId);
}