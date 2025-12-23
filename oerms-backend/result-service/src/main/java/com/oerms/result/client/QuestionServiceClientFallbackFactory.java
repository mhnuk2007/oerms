package com.oerms.result.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class QuestionServiceClientFallbackFactory implements FallbackFactory<QuestionServiceClient> {

    @Override
    public QuestionServiceClient create(Throwable cause) {
        return new QuestionServiceClient() {
            @Override
            public ApiResponse<List<QuestionDTO>> getQuestionsForGrading(List<UUID> questionIds) {
                log.error("Fallback: Failed to fetch questions for grading: {}", questionIds, cause);
                // Return empty list to allow partial result display
                return ApiResponse.success("Fallback: Questions unavailable", Collections.emptyList());
            }
        };
    }
}
