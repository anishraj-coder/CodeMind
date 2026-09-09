package com.backend.codemind.entity;

import com.backend.codemind.entity.enums.MessageRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID  id;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String citations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id",nullable = false)
    private ChatSession session;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
