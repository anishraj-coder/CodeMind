package com.backend.codemind.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ChatLifeCycleRepo {

    private final JdbcTemplate jdbcTemplate;

    public void deleteByConversationId(UUID sessionId){
        log.info("[ChatLifeCycleRepo]: Going to delete Conversations of Conversation Id: {}",sessionId);
        String sql= """
                    DELETE FROM spring_ai_chat_memory
                    WHERE conversation_id = ?
                    """;
        int rowsDeleted=jdbcTemplate.update(sql,sessionId.toString());
        log.info("[CHAT_LIFE_CYCLE_REPO]: Deleted {} rows for conversation ID : {}",rowsDeleted,sessionId);
    }
}
