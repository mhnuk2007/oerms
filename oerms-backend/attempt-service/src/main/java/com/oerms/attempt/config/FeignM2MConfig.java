package com.oerms.attempt.config;

import com.oerms.attempt.security.OAuth2ClientCredentialsManager;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;

@RequiredArgsConstructor
@Slf4j
public class FeignM2MConfig {

    private final OAuth2ClientCredentialsManager tokenManager;

    @Bean
    public RequestInterceptor m2mRequestInterceptor() {
        return template -> {
            try {
                String token = tokenManager.getToken();
                template.header("Authorization", "Bearer " + token);
                log.debug("Applied M2M token to Feign request for target: {}", template.feignTarget().name());
            } catch (Exception e) {
                log.error("Failed to apply M2M token for target: {}. Error: {}", template.feignTarget().name(), e.getMessage());
                // Optionally, you could re-throw as a runtime exception if you want the Feign call to fail immediately
                // throw new RuntimeException("Failed to obtain M2M token for Feign request", e);
            }
        };
    }
}
