package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignClientConfig;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ExamDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "exam-service", path = "/api/exams", configuration = FeignClientConfig.class)
public interface ExamServiceClient {

    @GetMapping("/{id}")
    ApiResponse<ExamDTO> getExam(@PathVariable("id") UUID examId);
}
