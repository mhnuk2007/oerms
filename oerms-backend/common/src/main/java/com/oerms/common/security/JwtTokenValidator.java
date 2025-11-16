package com.oerms.common.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;

public class JwtTokenValidator implements OAuth2TokenValidator<Jwt> {
    
    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {

        Instant expiresAt = jwt.getExpiresAt();
        if (expiresAt != null && expiresAt.isBefore(Instant.now())) {
            OAuth2Error error = new OAuth2Error(
                "invalid_token",
                "Token has expired",
                null
            );
            return OAuth2TokenValidatorResult.failure(error);
        }

        if (jwt.getSubject() == null || jwt.getSubject().isEmpty()) {
            OAuth2Error error = new OAuth2Error(
                    "invalid_token",
                    "Token is missing subject claim",
                    null
            );
            return OAuth2TokenValidatorResult.failure(error);
        }

        return OAuth2TokenValidatorResult.success();
    }
}