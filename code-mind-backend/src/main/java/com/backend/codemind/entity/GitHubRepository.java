package com.backend.codemind.entity;

import com.backend.codemind.entity.enums.IndexStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Getter@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "github_repositories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","github_repo_id"})
)
public class GitHubRepository {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String repositoryName;

    @Column(name = "github_repo_id")
    private Long githubRepoId;

    @Column(name="user_id",nullable = false)
    private Long userId;

    @Column(name="owner",length = 100,nullable = false)
    private String owner;

    @Column(name = "full_name",length = 200,nullable = false)
    private String fullName;

    @Column(nullable = false,name = "is_private")
    private boolean isPrivate;

    @Column(name = "default_branch",nullable = false)
    private String defaultBranch;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String htmlUrl;

    private String lastCommitHash;

    @Column(length = 500)
    private String description;

    @Builder.Default
    private IndexStatus indexStatus = IndexStatus.PENDING;

    private LocalDateTime indexedAt;

    @Builder.Default
    private Integer chunkCount=0;
    @Builder.Default
    private Integer filesTotal=0;
    @Builder.Default
    private Integer filesProcessed=0;


    private String errorMessage;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
