package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignClientConfig;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.StudentQuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "question-service",
    path = "/api/questions",
    configuration = FeignClientConfig.class,
    contextId = "studentQuestionServiceClient"
)
public interface StudentQuestionServiceClient {
    @GetMapping("/exam/{examId}/student")
    ApiResponse<List<StudentQuestionDTO>> getExamQuestionsForStudent(
        @PathVariable("examId") UUID examId,
        @RequestParam(defaultValue = "false") boolean shuffle);
}
