package com.oerms.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public class JwtUtils {

    private static Jwt getJwt(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("Invalid authentication or JWT missing");
        }
        return (Jwt) authentication.getPrincipal();
    }

    public static UUID getUserId(Authentication authentication) {
        Jwt jwt = getJwt(authentication);
        String userId = jwt.getClaim("userId");
        if (userId == null) {
            throw new IllegalArgumentException("userId claim not found in JWT");
        }
        return UUID.fromString(userId);
    }

    public static String getUsername(Authentication authentication) {
        return getJwt(authentication).getClaim("username");
    }

    public static String getEmail(Authentication authentication) {
        return getJwt(authentication).getClaim("email");
    }

    public static String getRole(Authentication authentication) {
        return getJwt(authentication).getClaimAsStringList("roles").get(0);
    }

    public static <T> T getClaim(Authentication authentication, String claimName, Class<T> type) {
        return getJwt(authentication).getClaim(claimName);
    }
}
