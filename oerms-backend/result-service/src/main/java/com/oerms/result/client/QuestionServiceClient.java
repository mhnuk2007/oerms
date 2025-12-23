package com.oerms.result.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.result.config.FeignM2MConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "question-service", 
    path = "/api/questions", 
    configuration = FeignM2MConfig.class,
    contextId = "questionServiceClient",
    fallbackFactory = QuestionServiceClientFallbackFactory.class
)
public interface QuestionServiceClient {

    @PostMapping("/internal/batch")
    ApiResponse<List<QuestionDTO>> getQuestionsForGrading(@RequestBody List<UUID> questionIds);
}
