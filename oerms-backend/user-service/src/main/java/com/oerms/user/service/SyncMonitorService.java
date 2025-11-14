package com.oerms.user.service;

import com.oerms.user.client.AuthServiceClient;
import com.oerms.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
* Optional: Periodic sync verification
* Checks if user-service is in sync with auth-server
*/
@Service
@RequiredArgsConstructor
@Slf4j
public class SyncMonitorService {

    private final UserProfileRepository userProfileRepository;
    private final AuthServiceClient authServiceClient;

    @Scheduled(fixedRate = 3600000) // Every hour
    public void verifySyncStatus() {
        try {
            long localUserCount = userProfileRepository.count();
            log.info("User-service has {} users synced", localUserCount);

            // You could add more sophisticated sync verification here
            // For example, comparing counts with auth-server
        } catch (Exception e) {
            log.error("Error verifying sync status", e);
        }
    }
}
