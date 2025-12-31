package com.oerms.exam.client;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
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

    /**
     * Get a single question by ID
     */
    @GetMapping("/{questionId}")
    ApiResponse<QuestionDTO> getQuestion(@PathVariable("questionId") UUID questionId);

    /**
     * Get multiple questions by their IDs (batch operation)
     * Using /internal/batch endpoint for service-to-service calls
     */
    @PostMapping("/internal/batch")
    ApiResponse<List<QuestionDTO>> getQuestionsByIds(@RequestBody List<UUID> questionIds);

    /**
     * Get question count for an exam
     */
    @GetMapping("/exam/{examId}/count")
    ApiResponse<Long> getQuestionCount(@PathVariable("examId") UUID examId);

    /**
     * Get all questions for an exam (teacher view with answers)
     */
    @GetMapping("/exam/{examId}")
    ApiResponse<List<QuestionResponse>> getExamQuestions(@PathVariable("examId") UUID examId);

    /**
     * Get total marks for all questions in an exam
     */
    @GetMapping("/exam/{examId}/total-marks")
    ApiResponse<Integer> getTotalMarks(@PathVariable("examId") UUID examId);

    /**
     * Get statistics for exam questions
     */
    @GetMapping("/exam/{examId}/statistics")
    ApiResponse<QuestionStatisticsDTO> getExamStatistics(@PathVariable("examId") UUID examId);

    /**
     * Validate if exam has questions
     */
    @GetMapping("/exam/{examId}/validate")
    ApiResponse<Boolean> validateExamQuestions(@PathVariable("examId") UUID examId);

    /**
     * Duplicate all questions from one exam to another
     * This endpoint needs to be added to QuestionController
     */
    @PostMapping("/exam/{sourceExamId}/duplicate/{targetExamId}")
    ApiResponse<List<QuestionDTO>> duplicateExamQuestions(
            @PathVariable("sourceExamId") UUID sourceExamId,
            @PathVariable("targetExamId") UUID targetExamId
    );
}
