package com.oerms.exam.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@Slf4j
public class TokenDebugController {

    @GetMapping("/token-info")
    public Map<String, Object> getTokenInfo(Authentication authentication) {
        Map<String, Object> info = new HashMap<>();
        
        if (authentication == null) {
            info.put("error", "No authentication");
            return info;
        }

        info.put("authenticated", authentication.isAuthenticated());
        info.put("principal", authentication.getName());
        info.put("authType", authentication.getClass().getSimpleName());
        
        // Get authorities
        info.put("authorities", authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));

        // If JWT token, get claims
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Map<String, Object> claims = new HashMap<>();
            jwtAuth.getToken().getClaims().forEach((key, value) -> {
                // Don't log sensitive claims
                if (!key.equals("exp") && !key.equals("iat") && !key.equals("nbf")) {
                    claims.put(key, value);
                }
            });
            info.put("claims", claims);
        }

        log.info("Token debug info: {}", info);
        return info;
    }
}