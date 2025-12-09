package com.oerms.exam.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
@EnableAsync
public class AsyncConfig {

    @PostConstruct
    public void enableSecurityContextPropagation() {
        // This ensures the SecurityContext is propagated to child threads,
        // which is necessary for libraries like Resilience4j that create their own thread pools.
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }
}
