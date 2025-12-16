package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptResponse;
import com.oerms.common.dto.StartAttemptRequest;
import com.oerms.exam.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "attempt-service", 
    path = "/api/attempts",
    configuration = FeignClientConfig.class  // ADD THIS LINE
)
public interface AttemptServiceClient {

    @PostMapping("/start")
    ApiResponse<AttemptResponse> startAttempt(
        @RequestBody StartAttemptRequest request
    );
}