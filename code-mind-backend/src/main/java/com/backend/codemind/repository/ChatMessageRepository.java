package com.backend.codemind.repository;

import com.backend.codemind.entity.ChatMessage;
import com.backend.codemind.entity.ChatSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllBySessionSessionIdOrderByCreatedAtDesc(UUID sessionId);

    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.session.sessionId = :sessionId
        ORDER BY m.createdAt DESC, m.id DESC
    """)
    List<ChatMessage> findFirstPageBySessionSessionId(
            @Param("sessionId") UUID sessionId,
            Pageable pageable);


    @Query("""
        SELECT m FROM ChatMessage m
        WHERE m.session.sessionId = :sessionId
          AND (m.createdAt < :cursorTime OR (m.createdAt = :cursorTime AND m.id < :cursorId))
        ORDER BY m.createdAt DESC, m.id DESC
    """)
    List<ChatMessage> findNextPageBySessionSessionId(
            @Param("sessionId") UUID sessionId,
            @Param("cursorTime") LocalDateTime cursorTime,
            @Param("cursorId") UUID cursorId,
            Pageable pageable);

    int deleteAllBySession(ChatSession session);
    Long countAllBySessionSessionId(UUID sessionId);
    Optional<ChatMessage> findFirstBySessionSessionIdOrderByCreatedAtAsc(UUID sessionId);
}