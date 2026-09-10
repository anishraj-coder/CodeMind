package com.backend.codemind.service.chat;

import com.backend.codemind.dto.*;
import com.backend.codemind.entity.ChatMessage;
import com.backend.codemind.entity.ChatSession;
import com.backend.codemind.entity.enums.MessageRole;
import com.backend.codemind.exceptions.NotFoundException;
import com.backend.codemind.repository.ChatMessageRepository;
import com.backend.codemind.repository.ChatSessionRepository;
import com.backend.codemind.service.ai.ChatPromptBuilder;
import com.backend.codemind.service.ai.CitationMapper;
import com.backend.codemind.service.ai.CodeContextRetriever;
import com.backend.codemind.util.ChatClientFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClientFactory chatClientFactory;
    private final ChatMemory chatMemory;
    private final CodeContextRetriever codeContextRetriever;
    private final ChatPromptBuilder chatPromptBuilder;
    private final CitationMapper citationMapper;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionRepository chatSessionRepository;


    @Transactional
    public ChatSession createChatSession(Long userId, Long repoId) {
        ChatSession newChatSession = ChatSession.builder()
                .repoId(repoId)
                .userId(userId)
                .build();
        return chatSessionRepository.save(newChatSession);
    }

    @Transactional
    public Flux<ServerSentEvent<String>> streamChat(UUID sessionId, ChatRequest request) {
        var retriedContext = codeContextRetriever.retrieve(request.repoId(), request.question());
        saveUserMessage(sessionId, request.question());
        String userPrompt = chatPromptBuilder.userPrompt(retriedContext.contextText(),
                request.question());
        var chatClientBuilder = chatClientFactory.getChatClient("gemini");
        String systemPrompt = chatPromptBuilder.systemPrompt(request.repositoryFullName());
        ChatClient chatClient = chatClientBuilder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
        StringBuilder assistantAccumulator = new StringBuilder();

        return Flux.concat(
                Flux.just(
                        ServerSentEvent.<String>builder()
                                .event("citations")
                                .data(citationMapper.toJson(retriedContext.citations()))
                                .build()
                ),
                chatClient.prompt()
                        .system(systemPrompt)
                        .user(userPrompt)
                        .advisors(advisorSpec -> advisorSpec
                                .params(Map.of(ChatMemory.CONVERSATION_ID, sessionId.toString()))
                                .advisors(List.of(new SimpleLoggerAdvisor()))
                        )
                        .stream()
                        .content()
                        .map(token -> {
                            assistantAccumulator.append(token);
                            return ServerSentEvent.<String>builder()
                                    .event("token")
                                    .data(token)
                                    .build();
                        })
                        .doOnComplete(() -> saveChatMessage(sessionId, assistantAccumulator.toString(), retriedContext))
                        .doOnError(ex -> log.error("[CHAT_SERVICE]: Error while streaming chat response", ex)),
                Flux.just(
                        ServerSentEvent.<String>builder()
                                .event("done")
                                .data("[DONE]")
                                .build())
        );
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionHistory(UUID sessionId) {
        List<ChatMessage> chatMessages = chatMessageRepository
                .findAllBySessionSessionIdOrderByCreatedAtDesc(sessionId);
        return chatMessages.stream()
                .map(this::mapToChatMessageResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaginatedChatHistory getPaginatedChatHistory(UUID sessionId, String before, int limit) {
        LocalDateTime cursorTime = null;
        UUID cursorId = null;

        if (StringUtils.hasText(before)) {
            var parts = before.split("\\|", 2);
            if (parts.length == 2) {
                try {
                    cursorTime = LocalDateTime.parse(parts[0]);
                    cursorId = UUID.fromString(parts[1]);
                } catch (Exception ex) {
                    log.warn("[PAGINATION]: Invalid cursor format '{}', fetching from start", before);
                }
            }
        }

        var pageable = Pageable.ofSize(limit + 1);

        List<ChatMessage> messages = (cursorTime == null || cursorId == null)
                ? chatMessageRepository.findFirstPageBySessionSessionId(sessionId, pageable)
                : chatMessageRepository.findNextPageBySessionSessionId(sessionId, cursorTime, cursorId, pageable);

        boolean hasMore = messages.size() > limit;
        if (hasMore) {
            messages = messages.subList(0, limit);
        }
        String nextKey = null;
        if (hasMore && !messages.isEmpty()) {
            var last = messages.getLast();  // Java 21+ method, safe on Java 25
            nextKey = last.getCreatedAt() + "|" + last.getId();  // Use pipe delimiter
        }

        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(this::mapToChatMessageResponse)
                .toList();

        var metaData = PaginationMeta.builder()
                .nextKey(nextKey)
                .hasMore(hasMore)
                .build();

        return PaginatedChatHistory.builder()
                .messages(messageResponses)
                .pagination(metaData)
                .build();
    }

    @Transactional
    public List<ChatSessionResponse> getAllSessions(Long userId, Long repoId) {
        List<ChatSession> sessions = chatSessionRepository.findAllByUserIdAndRepoIdOrderByCreatedAtDesc(userId, repoId);
        List<ChatSessionResponse> filteredSession = new ArrayList<>();
        for (ChatSession session : sessions) {
//            List<ChatMessage> messages=chatMessageRepository
//                    .findAllBySessionIdOrderByCreatedAtDesc(session.getSessionId());
            int messageCount = session.getMessages().size();
            if (messageCount == 0) {
                chatSessionRepository.delete(session);
                continue;
            }
            String title = session.getSessionTitle();
            if (!StringUtils.hasText(title)) {
                title = chatMessageRepository.findFirstBySessionSessionIdOrderByCreatedAtAsc(session.getSessionId())
                        .map(ChatMessage::getContent)
                        .map(msg -> msg.length() > 30 ? msg.substring(0, 30) + "..." : msg)
                        .orElse("New chat");
                session.setSessionTitle(title);
                chatSessionRepository.save(session);
            }
            filteredSession.add(ChatSessionResponse.builder()
                    .sessionTitle(title)
                    .messages(messageCount/2L)
                    .sessionId(session.getSessionId())
                    .build());
        }
        return filteredSession;
    }


    private void saveChatMessage(UUID sessionId, String content, RetrievedContext context) {
        ChatSession session=chatSessionRepository.findById(sessionId)
                .orElseThrow(()->new NotFoundException("Invalid sessionId"));

        String citations = citationMapper.toJson(context.citations());
        ChatMessage chatMessage = ChatMessage.builder()
                .content(content)
                .citations(citations)
                .role(MessageRole.ASSISTANT)
                .session(session)
                .build();
        chatMessageRepository.save(chatMessage);
    }


    private void saveUserMessage(UUID sessionId, String question) {
        ChatSession session=chatSessionRepository.findById(sessionId)
                        .orElseThrow(()->new NotFoundException("Invalid session ID"));
        chatMessageRepository.save(
                ChatMessage.builder()
                        .session(session)
                        .role(MessageRole.USER)
                        .content(question)
                        .build()
        );
    }

    private ChatMessageResponse mapToChatMessageResponse(ChatMessage message){
        return ChatMessageResponse.builder()
                .id(message.getId()).role(message.getRole()).content(message.getContent())
                .citations(citationMapper.fromJson(message.getCitations()))
                .createdAt(message.getCreatedAt()).build();
    }
}
