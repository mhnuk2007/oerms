package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignM2MConfig;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "question-service",
    path = "/api/questions",
    configuration = FeignM2MConfig.class,
    contextId = "teacherQuestionServiceClient"
)
public interface TeacherQuestionServiceClient {
    @GetMapping("/exam/{examId}")
    ApiResponse<List<QuestionDTO>> getExamQuestions(@PathVariable("examId") UUID examId);
}
