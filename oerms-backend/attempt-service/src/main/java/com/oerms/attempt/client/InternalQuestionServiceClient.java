package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignM2MConfig;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "internal-question-service",
    url = "${question-service.url}",
    path = "/api/questions/internal",
    configuration = FeignM2MConfig.class,
    contextId = "internalQuestionServiceClient"
)
public interface InternalQuestionServiceClient {
    @PostMapping("/batch")
    ApiResponse<List<QuestionDTO>> getQuestionsByIds(@RequestBody List<UUID> questionIds);
}
