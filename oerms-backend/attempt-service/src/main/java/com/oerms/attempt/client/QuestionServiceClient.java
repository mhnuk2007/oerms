package com.oerms.attempt.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.common.dto.QuestionStatisticsDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "question-service", path = "/api/questions")
public interface QuestionServiceClient {

    @GetMapping("/{id}")
    ApiResponse<QuestionDTO> getQuestion(@PathVariable("id") UUID questionId);

    @GetMapping("/exam/{examId}/count")
    ApiResponse<Long> getQuestionCount(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}/total-marks")
    ApiResponse<Integer> getTotalMarks(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}/statistics")
    ApiResponse<QuestionStatisticsDTO> getExamStatistics(@PathVariable("examId") UUID examId);

    @GetMapping("/exam/{examId}/validate")
    ApiResponse<Boolean> validateExamQuestions(@PathVariable("examId") UUID examId);
}
