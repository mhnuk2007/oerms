package com.oerms.question.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.question.config.FeignClientConfig;
import com.oerms.question.config.FeignErrorConfig;
import com.oerms.question.dto.ExamDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
        name = "exam-service",
        configuration = {FeignClientConfig.class, FeignErrorConfig.class}
)
public interface ExamServiceClient {

    @GetMapping("/api/exams/{id}")
    ApiResponse<ExamDTO> getExam(@PathVariable("id") UUID id);  // Changed return type
}