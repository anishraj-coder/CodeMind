package com.backend.codemind.service;

import com.backend.codemind.entity.AppUser;
import com.backend.codemind.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppUserService {
    private final AppUserRepository appUserRepository;
    private final TextEncryptor textEncryptor;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AppUser getUserById(Long id){
        Optional<AppUser> userOptional=appUserRepository.findById(id);
        if(userOptional.isPresent())return userOptional.get();
        else throw  new IllegalArgumentException("Invalid Id");
    }

    public String decryptAccessToken(AppUser user){
        return textEncryptor.decrypt(user.getAccessToken());
    }

    @Transactional
    public AppUser upsertFromGithub(Map<String,Object> attributes,String accessToken,String scopes){
        Long githubId=toLong(attributes.get("id"));
        String login=String.valueOf(attributes.get("login"));
        String name=String.valueOf(attributes.get("name"))!=null?
                String.valueOf(attributes.get("name")):login;
        String avatarUrl=String.valueOf(attributes.get("avatar_url"));

        String encryptedToken=passwordEncoder.encode(accessToken);

        AppUser user= appUserRepository.findByGithubId(githubId.toString()).orElseGet(AppUser::new);

        user.setAccessToken(encryptedToken);
        user.setAvatarUrl(avatarUrl);
        user.setDisplayName(name);
        user.setGithubId(githubId);
        user.setGithubUserName(login);
        user.setTokenScope(scopes);
        return user;

    }

    private static Long toLong(Object value){
        if(value instanceof Number number){
            return number.longValue();
        }

        return Long.parseLong(String.valueOf(value));
    }
}
