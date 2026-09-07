package com.backend.codemind.service.ai;

public final class RagSettings {
    public static final int TOP_K_CHUNKS=8;
    public static final long STREAM_TIMEOUT_MS =100_000L;
    public static final String START_LINE="start_line";
    public static final String END_LINE="end_line";
    public static final String METADATA_REPO_ID="repo_id";
    public static final String FILE_PATH="file_path";
    public static final String LANGUAGE="language";
    public static final String CHUNK_INDEX="chunk_idx";
    private RagSettings(){

    }
}
