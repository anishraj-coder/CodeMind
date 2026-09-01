package com.backend.codemind.dto;

import com.backend.codemind.entity.AppUser;
import lombok.Builder;

@Builder
public record UserResponse(
        Long id,
        String githubId,
        String githubUsername,
        String displayName,
        String avatarUrl
) {

    public static  UserResponse of(Long id, String githubId,
                                   String githubUsername,String displayName,String avatarUrl){
        return new UserResponse(id,githubId,githubUsername,displayName,avatarUrl);
    }

    public static UserResponse of(AppUser user){
        return UserResponse.of(user.getId(), String.valueOf(user.getGithubId()),
                user.getGithubUserName(),user.getDisplayName(),user.getAvatarUrl());
    }
}
