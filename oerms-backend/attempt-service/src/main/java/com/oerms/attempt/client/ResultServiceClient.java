package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignM2MConfig;
import com.oerms.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "result-service", path = "/api/results", configuration = FeignM2MConfig.class)
public interface ResultServiceClient {

    @GetMapping("/attempt/{attemptId}")
    ApiResponse<ResultDTO> getResultByAttemptId(@PathVariable("attemptId") UUID attemptId);
}
