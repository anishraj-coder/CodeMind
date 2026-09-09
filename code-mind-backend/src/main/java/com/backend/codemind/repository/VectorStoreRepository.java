package com.backend.codemind.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Slf4j
@RequiredArgsConstructor
@Repository
public class VectorStoreRepository {

    private final JdbcTemplate jdbcTemplate;

    public void deleteByRepoId(Long repoId){
        String sql = """
        DELETE FROM vector_store
        WHERE metadata ->> 'repo_id' = ?
        """;

        int rowsDeleted = jdbcTemplate.update(sql, repoId.toString());
        log.info("[VECTOR_STORE_REPO]: Deleted {} chunks for repo ID {}", rowsDeleted, repoId);
    }
}
