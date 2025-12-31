package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.AttemptResponse;
import com.oerms.common.dto.StartAttemptRequest;
import com.oerms.exam.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(
    name = "attempt-service", 
    path = "/api/attempts"
)
public interface AttemptServiceClient {

    @PostMapping("/start")
    ApiResponse<AttemptResponse> startAttempt(
        @RequestBody StartAttemptRequest request
    );

    @GetMapping("/my-attempts/count")
    ApiResponse<Long> getStudentExamAttemptsCount(
        @RequestParam("examId") UUID examId, 
        @RequestParam("studentId") UUID studentId
    );

    @GetMapping("/has-completed")
    ApiResponse<Boolean> hasCompletedExam(
        @RequestParam("examId") UUID examId, 
        @RequestParam("studentId") UUID studentId
    );
}