package com.backend.codemind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter@Setter
@Entity
@Table(name = "chat_session")
public class ChatSession {

    @Id
    @Column(name = "session_id")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID sessionId;

    @Column(nullable = false,name = "user_id")
    private Long userId;

    @Column(nullable = false,name="repo_id")
    private Long repoId;

    @Column(name = "session_title",length = 40)
    private String sessionTitle;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
