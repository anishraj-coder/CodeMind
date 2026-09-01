package com.backend.codemind.controller;

import com.backend.codemind.dto.UserResponse;
import com.backend.codemind.entity.AppUser;
import com.backend.codemind.security.AppUserPrincipal;
import com.backend.codemind.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final CurrentUser currentUser;

    @GetMapping("/login-url")
    public Map<String,String> loginUrl(){
        return Map.of("url","/oauth2/authorization/github");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(){
        AppUserPrincipal userPrincipal=currentUser.require();
        AppUser user=userPrincipal.getUser();
        return ResponseEntity.ok(UserResponse.of(user));
    }
}
