package com.oerms.result.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptAnswerDTO;
import com.oerms.common.dto.AttemptDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class AttemptServiceClientFallbackFactory implements FallbackFactory<AttemptServiceClient> {

    @Override
    public AttemptServiceClient create(Throwable cause) {
        return new AttemptServiceClient() {
            @Override
            public ApiResponse<AttemptDTO> getAttempt(UUID attemptId) {
                log.error("Fallback: Failed to fetch attempt: {}", attemptId, cause);
                return null;
            }

            @Override
            public ApiResponse<List<AttemptAnswerDTO>> getAttemptAnswers(UUID attemptId) {
                log.error("Fallback: Failed to fetch answers for attempt: {}", attemptId, cause);
                // Return empty list to allow partial result display
                return ApiResponse.success("Fallback: Answers unavailable", Collections.emptyList());
            }
        };
    }
}
