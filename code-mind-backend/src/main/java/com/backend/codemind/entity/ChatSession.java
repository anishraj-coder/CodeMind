package com.backend.codemind.entity;

import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @OneToMany(mappedBy = "session",cascade = CascadeType.REMOVE,orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<ChatMessage> messages = new ArrayList<>();

}
