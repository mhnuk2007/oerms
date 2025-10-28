package com.oerms.user.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("userSecurity")
public class UserSecurity {
    
    public boolean isOwner(UUID userId, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }
        
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String tokenUserId = jwt.getClaimAsString("userId");
        
        return userId.toString().equals(tokenUserId);
    }
}