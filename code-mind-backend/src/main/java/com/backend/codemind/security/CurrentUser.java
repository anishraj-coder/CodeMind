package com.backend.codemind.security;

import com.backend.codemind.exceptions.UnauthorizedAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public AppUserPrincipal require(){
        Authentication auth= SecurityContextHolder.getContext().getAuthentication();
        if(auth==null||!(auth.getPrincipal() instanceof AppUserPrincipal principal)){
            throw new UnauthorizedAccessException("User is un authorized");
        }

        return principal;
    }
}
