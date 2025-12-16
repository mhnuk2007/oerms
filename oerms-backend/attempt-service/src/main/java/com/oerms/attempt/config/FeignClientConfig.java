package com.oerms.attempt.config;

import feign.RequestInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Slf4j
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Only add the user token if an Authorization header is not already present
            if (requestTemplate.headers().containsKey("Authorization")) {
                log.debug("Authorization header already exists. Skipping user token interceptor for target: {}", requestTemplate.feignTarget().name());
                return;
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
                String token = jwtAuthenticationToken.getToken().getTokenValue();
                requestTemplate.header("Authorization", "Bearer " + token);
                log.debug("Applied user token to Feign request for target: {}", requestTemplate.feignTarget().name());
            } else {
                log.warn("No JWT authentication token found in SecurityContext. Cannot apply user token to Feign request for target: {}", requestTemplate.feignTarget().name());
            }
        };
    }
}
