package com.backend.codemind.controller;

import com.backend.codemind.config.WithRateLimiter;
import com.backend.codemind.dto.ChatMessageResponse;
import com.backend.codemind.dto.ChatRequest;
import com.backend.codemind.dto.ChatSessionResponse;
import com.backend.codemind.entity.ChatMessage;
import com.backend.codemind.security.CurrentUser;
import com.backend.codemind.service.chat.ChatLifeCycleService;
import com.backend.codemind.service.chat.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final CurrentUser currentUser;
    private final ChatLifeCycleService chatLifeCycleService;

    @WithRateLimiter
    @PostMapping("/sessions/{repoId}/create")
    public ResponseEntity<Map<String,UUID>> createChatSession(@PathVariable("repoId") Long repoId){
        Long userId=currentUser.require().getUser().getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("sessionId",chatService.createChatSession(userId,repoId).getSessionId()));
    }

    @PostMapping("/sessions/stream")
    public Flux<ServerSentEvent<String>> streamChat(
            @RequestHeader("session_id") String sessionId,
            @RequestBody ChatRequest request
            ){
        return chatService.streamChat(UUID.fromString(sessionId),request);
    }

    @GetMapping("/sessions/history")
    public ResponseEntity<List<ChatMessageResponse>> getSessionHistory(
            @RequestHeader("session_id") String sessionId
    ){
        return ResponseEntity.ok(chatService.getSessionHistory(UUID.fromString(sessionId)));
    }

    @GetMapping("/sessions/{repoId}")
    public List<ChatSessionResponse> listAllSessions(
            @PathVariable("repoId")Long repoId
    ){
        Long userId=currentUser.require().getUser().getId();
        return chatService.getAllSessions(userId,repoId);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteChatSession(@RequestHeader(name = "session_id") UUID sessionId){
        Long userId=currentUser.require().getUser().getId();
        chatLifeCycleService.deleteChatSession(sessionId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }


}
