package com.backend.codemind.repository;

import com.backend.codemind.entity.ChatMessage;
import com.backend.codemind.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllBySessionSessionIdOrderByCreatedAtDesc(UUID sessionId);
    int deleteAllBySession(ChatSession session);
    Long countAllBySessionSessionId(UUID sessionId);
    Optional<ChatMessage> findFirstBySessionSessionIdOrderByCreatedAtAsc(UUID sessionId);
}