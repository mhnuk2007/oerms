package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "question-service")
public interface QuestionServiceClient {

    @GetMapping("/api/questions/exam/{examId}/count")
    ApiResponse<Long> getQuestionCount(@PathVariable("examId") Long examId);
}
