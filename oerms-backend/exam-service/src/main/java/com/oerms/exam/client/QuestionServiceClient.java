package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.exam.config.FeignClientConfig;
import com.oerms.exam.dto.QuestionResponse;
import com.oerms.exam.dto.QuestionStatisticsDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@FeignClient(
    name = "question-service",
    path = "/api/questions",
    configuration = FeignClientConfig.class,
    fallback = QuestionServiceFallback.class
)
public interface QuestionServiceClient {

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

@Component
class QuestionServiceFallback implements QuestionServiceClient {
    @Override
    public ApiResponse<QuestionResponse> getQuestion(UUID questionId) {
        return ApiResponse.<QuestionResponse>builder().success(false).message("Fallback").build();
    }

    @Override
    public ApiResponse<List<QuestionResponse>> getQuestionsByIds(List<UUID> questionIds) {
        return ApiResponse.<List<QuestionResponse>>builder().success(false).message("Fallback").build();
    }

    @Override
    public ApiResponse<Boolean> validateQuestion(UUID questionId) {
        return ApiResponse.<Boolean>builder().success(false).data(false).message("Fallback").build();
    }

    @Override
    public ApiResponse<Long> getQuestionCount(UUID examId) {
        return ApiResponse.<Long>builder().success(false).data(0L).message("Fallback").build();
    }

    @Override
    public ApiResponse<List<QuestionResponse>> getExamQuestions(UUID examId) {
        return ApiResponse.<List<QuestionResponse>>builder().success(false).message("Fallback").build();
    }

    @Override
    public ApiResponse<Integer> getTotalMarks(UUID examId) {
        return ApiResponse.<Integer>builder().success(false).data(0).message("Fallback").build();
    }

    @Override
    public ApiResponse<QuestionStatisticsDTO> getExamStatistics(UUID examId) {
        return ApiResponse.<QuestionStatisticsDTO>builder().success(false).message("Fallback").build();
    }
}
