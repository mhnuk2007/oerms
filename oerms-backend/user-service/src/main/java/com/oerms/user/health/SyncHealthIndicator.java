package com.oerms.user.health;

import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SyncHealthIndicator implements HealthIndicator {

    private final UserProfileRepository userProfileRepository;

    @Override
    public Health health() {
        try {
            long userCount = userProfileRepository.count();
            return Health.up()
                .withDetail("syncedUsers", userCount)
                .withDetail("status", "Synced")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
