package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.exam.config.FeignM2MConfig;
import com.oerms.exam.dto.QuestionResponse;
import com.oerms.exam.dto.QuestionStatisticsDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "question-service",
    path = "/api/questions",
    configuration = FeignM2MConfig.class,
    contextId = "teacherQuestionServiceClient"
)
public interface TeacherQuestionServiceClient {

    @GetMapping("/{questionId}")
    ApiResponse<QuestionResponse> getQuestion(@PathVariable("questionId") UUID questionId);

    @PostMapping("/batch")
    ApiResponse<List<QuestionResponse>> getQuestionsByIds(@RequestBody List<UUID> questionIds);

    @GetMapping("/validate/{questionId}")
    ApiResponse<Boolean> validateQuestion(@PathVariable("questionId") UUID questionId);

    @GetMapping("/exam/{examId}/count")
    ApiResponse<Long> getQuestionCount(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}")
    ApiResponse<List<QuestionResponse>> getExamQuestions(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}/total-marks")
    ApiResponse<Integer> getTotalMarks(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}/statistics")
    ApiResponse<QuestionStatisticsDTO> getExamStatistics(@PathVariable("examId") UUID examId);
}
