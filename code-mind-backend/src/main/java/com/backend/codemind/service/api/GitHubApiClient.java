package com.backend.codemind.service.api;

import java.util.List;
import java.util.Map;

public interface GitHubApiClient {
    List<Map<String,Object>> listUserRepo(String accessToken);
    String getFileContent(String accessToken,String owner,String repoName,String path);
    Map<String,Object> getRepoTree(String accessToken,String owner,String repo,String branch);
    List<Map<String,Object>> getCommits(String accessToken,String owner,String repoName);
}
