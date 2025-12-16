package com.oerms.exam.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import feign.RequestInterceptor;
import feign.Retryer;
import feign.codec.Decoder;
import feign.codec.ErrorDecoder;
import feign.jackson.JacksonDecoder;
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
            if (requestTemplate.headers().containsKey("Authorization")) {
                log.debug("Authorization header already present for target: {}",
                        requestTemplate.feignTarget().name());
                return;
            }

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            log.debug("=== Feign Request Interceptor ===");
            log.debug("Target: {}", requestTemplate.feignTarget().name());
            log.debug("URL: {} {}", requestTemplate.method(), requestTemplate.url());
            log.debug("Authentication type: {}",
                    authentication != null ? authentication.getClass().getSimpleName() : "null");

            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                String token = jwtAuth.getToken().getTokenValue();
                requestTemplate.header("Authorization", "Bearer " + token);
                log.debug("✓ Added Authorization header (token length: {})", token.length());

                if (log.isTraceEnabled()) {
                    log.trace("Token claims: {}", jwtAuth.getToken().getClaims());
                }
            } else {
                log.warn("⚠ No JWT token found in SecurityContext for target: {}. Authentication: {}",
                        requestTemplate.feignTarget().name(),
                        authentication != null ? authentication.getClass().getName() : "null");
            }
        };
    }

    @Bean
    public ErrorDecoder errorDecoder() {
        return new FeignErrorDecoder();
    }

    @Bean
    public Retryer retryer() {
        return Retryer.NEVER_RETRY;
    }

    @Bean
    public Decoder feignDecoder(ObjectMapper feignObjectMapper) {
        return new JacksonDecoder(feignObjectMapper);
    }
}
