package com.oerms.exam.config;

import feign.RequestInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
@Slf4j
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            log.debug("=== Feign Interceptor ===");
            log.debug("Authentication: {}", authentication);
            log.debug("Authentication class: {}", authentication != null ? authentication.getClass().getName() : "null");

            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                String token = jwtAuth.getToken().getTokenValue();
                requestTemplate.header("Authorization", "Bearer " + token);
                log.debug("Added Authorization header with token: Bearer {}...", token.substring(0, Math.min(20, token.length())));
            } else {
                log.warn("No JWT token found in SecurityContext! Authentication type: {}",
                        authentication != null ? authentication.getClass().getName() : "null");
            }
        };
    }
}
