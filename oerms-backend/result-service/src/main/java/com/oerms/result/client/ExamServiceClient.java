package com.oerms.result.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.ExamDTO;
import com.oerms.result.config.FeignM2MConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
    name = "exam-service", 
    path = "/api/exams", 
    configuration = FeignM2MConfig.class,
    contextId = "examServiceClient" // Add unique contextId
)
public interface ExamServiceClient {
    
    @GetMapping("/{id}")
    ApiResponse<ExamDTO> getExam(@PathVariable("id") UUID examId);
}
