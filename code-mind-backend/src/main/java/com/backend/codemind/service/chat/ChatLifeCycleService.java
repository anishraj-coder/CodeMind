package com.backend.codemind.service.chat;

import com.backend.codemind.entity.ChatSession;
import com.backend.codemind.entity.GitHubRepository;
import com.backend.codemind.entity.enums.IndexStatus;
import com.backend.codemind.exceptions.NotFoundException;
import com.backend.codemind.repository.*;
import com.backend.codemind.service.GitHubRepositoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatLifeCycleService {
    private final VectorStoreRepository vectorStoreRepository;
    private final ChatSessionRepository chatSessionRepository;
    private  final GitHubRepositoryService gitHubRepositoryService;
    private final ChatLifeCycleRepo chatLifeCycleRepo;
    private final GitHubRepositoryRepository gitHubRepositoryRepository;

    @Modifying
    @Transactional
    public void deleteChatSession(UUID sessionId){
        log.info("[CHAT_LIFE_CYCLE_SERVICE]: delete request for session Id {} ",sessionId);
        ChatSession session=chatSessionRepository.findById(sessionId)
                .orElseThrow(()->new NotFoundException("Invalid Session ID"));

        chatSessionRepository.delete(session);
        chatLifeCycleRepo.deleteByConversationId(sessionId);

    }

    @Transactional
    public void deleteByUserIdAndRepID(Long userId, Long repoId){
        log.info("[CHAT_LIFE_CYCLE_SERVICE]: delete request for repId Id {} ",repoId);
        try {
            GitHubRepository repository=gitHubRepositoryService.requireOwned(userId,repoId);
            repository.setIndexedAt(null);
            repository.setChunkCount(0);
            repository.setFilesTotal(0);
            repository.setFilesProcessed(0);
            repository.setIndexStatus(IndexStatus.PENDING);
            gitHubRepositoryRepository.save(repository);

            List<ChatSession> sessions=chatSessionRepository.findAllByUserIdAndRepoIdOrderByCreatedAtDesc(userId,repoId);
            chatSessionRepository.deleteAll(sessions);
            vectorStoreRepository.deleteByRepoId(repoId);
            for (ChatSession session: sessions){
                chatLifeCycleRepo.deleteByConversationId(session.getSessionId());
            }
        }catch (Exception ex){
            log.info("[CHAT_LIFE_CYCLE_SERVICE]: Failed to delete for repId Id {} ex: {} ",
                    repoId,ex.getMessage());
        }
    }

}
