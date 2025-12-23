package com.oerms.result.client;


import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptAnswerDTO;
import com.oerms.common.dto.AttemptDTO;
import com.oerms.result.config.FeignM2MConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;


@FeignClient(
    name = "attempt-service", 
    path = "/api/attempts", 
    configuration = FeignM2MConfig.class,
    contextId = "attemptServiceClient",
    fallbackFactory = AttemptServiceClientFallbackFactory.class
)
public interface AttemptServiceClient {
    
    @GetMapping("/{id}")
    ApiResponse<AttemptDTO> getAttempt(@PathVariable("id") UUID attemptId);

    @GetMapping("/{attemptId}/answers")
    ApiResponse<List<AttemptAnswerDTO>> getAttemptAnswers(@PathVariable("attemptId") UUID attemptId);
}
