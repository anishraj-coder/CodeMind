package com.backend.codemind.service.github;

import lombok.RequiredArgsConstructor;
import org.apache.http.HttpHeaders;
import org.springframework.context.annotation.Bean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GitHubApiClientImpl implements GitHubApiClient {

    private static final String API_BASE="https://api.github.com";
    private static final ParameterizedTypeReference<List<Map<String,Object>>> LIST_MAP=
            new ParameterizedTypeReference<List<Map<String, Object>>>() {
    };
    private static final ParameterizedTypeReference<Map<String,Object>> MAP=
            new ParameterizedTypeReference<Map<String, Object>>() {
    };
    private final RestClient.Builder restClientBuilder;

    public RestClient client(String accessToken){
        return restClientBuilder.baseUrl(API_BASE)
                .defaultHeader(HttpHeaders.AUTHORIZATION,"Bearer "+accessToken)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader(HttpHeaders. USER_AGENT, "codemind")
                .build();
    }

    @Override
    public List<Map<String,Object>> listUserRepo(String accessToken){
        List<Map<String,Object>>all=new ArrayList<>();

        int page=1;
        while(page<=10){
            final int currentPage=page;
            List<Map<String,Object>> currentRepos=client(accessToken)
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/user/repos")
                            .queryParam("affiliation","owner,collaborator,organization_member")
                            .queryParam("sort","updated")
                            .queryParam("per_page",100)
                            .queryParam("page",currentPage)
                            .build()
                    ).retrieve().body(LIST_MAP);
            if(currentRepos==null||currentRepos.isEmpty())break;
            all.addAll(currentRepos);
            if(currentRepos.size()<100)break;
            page++;
        }

        return all;

    }

    @Override
    public String getFileContent(String accessToken,String owner,String repo,String path){

        Map<String,Object>body=client(accessToken)
                .get()
                .uri("/repos/{owner}/{repo}/contents/{path}",owner,repo,path)
                .retrieve().body(MAP);
        if(body==null||body.isEmpty()){
            return null;
        }
        Object encoding=body.get("encoding");
        Object content=body.get("content");
        if(content==null){
            return null;
        }
        if("base64".equals(encoding.toString())){
            String raw=String.valueOf(content).replace("\\s","");
            return new String(Base64.getDecoder().decode(raw), StandardCharsets.UTF_8);
        }

        return String.valueOf(content);
    }

    @Override
    public Map<String,Object> getRepoTree(String accessToken,String owner,String repo,String branch){
        Map<String,Object>body=client(accessToken)
                .get()
                .uri("/repos/{owner}/{repo}/git/tree/{branch}?recursive=1",owner,repo,branch)
                .retrieve().body(MAP);
        return body;
    }

    @Override
    public List<Map<String,Object>> getCommits(String accessToken, String owner, String repoName) {
        List<Map<String,Object>>commits=client(accessToken)
                .get()
                .uri("/repos/{owner}/{repoName}/commits",owner,repoName)
                .retrieve().body(LIST_MAP);
        return commits;
    }

}
