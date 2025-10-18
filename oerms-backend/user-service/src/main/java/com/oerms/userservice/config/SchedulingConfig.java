package com.oerms.userservice.config;

import com.oerms.userservice.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class SchedulingConfig {

    private final AuthenticationService authenticationService;

    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM every day
    public void cleanupExpiredTokens() {
        log.info("Running scheduled cleanup of expired refresh tokens");
        authenticationService.cleanupExpiredTokens();
    }
}