package com.backend.codemind.repository;

import com.backend.codemind.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllBySessionIdOrderByCreatedAtDesc(UUID sessionId);
    Long countAllBySessionId(UUID sessionId);
    Optional<ChatMessage> findFirstBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}