package com.oerms.attempt.client;

import com.oerms.attempt.config.FeignClientConfig;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.QuestionDTO;
import com.oerms.common.dto.QuestionStatisticsDTO;
import com.oerms.common.dto.StudentQuestionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

/**
 * Feign client for Question Service
 * All endpoints are verified to exist in question-service
 */
@FeignClient(name = "question-service", path = "/api/questions", configuration = FeignClientConfig.class)
public interface QuestionServiceClient {

    /**
     * Get all questions for an exam (with answers - for teachers/admins)
     * Maps to: GET /api/questions/exam/{examId}
     * <p>
     * Note: This returns full QuestionDTO with correctAnswer field
     * For students during exam, use getExamQuestionsForStudent instead
     */
    @GetMapping("/exam/{examId}")
    ApiResponse<List<QuestionDTO>> getExamQuestions(@PathVariable("examId") UUID examId);

    /**
     * Get all questions for an exam (without answers - for students)
     * Maps to: GET /api/questions/exam/{examId}/student
     * <p>
     * Note: This returns StudentQuestionDTO without correctAnswer field
     * Used when students are taking the exam
     */
    @GetMapping("/exam/{examId}/student")
    ApiResponse<List<StudentQuestionDTO>> getExamQuestionsForStudent(
            @PathVariable("examId") UUID examId,
            @RequestParam(defaultValue = "false") boolean shuffle);

    /**
     * Get a single question by ID
     * Maps to: GET /api/questions/{id}
     */
    @GetMapping("/{id}")
    ApiResponse<QuestionDTO> getQuestion(@PathVariable("id") UUID questionId);

    /**
* Get question count for an exam
* Maps to: GET /api/questions/exam/{examId}/count
*/
@GetMapping("/exam/{examId}/count")
ApiResponse<Long> getQuestionCount(@PathVariable("examId") UUID examId);

/**
 * Get total marks for an exam
 * Maps to: GET /api/questions/exam/{examId}/total-marks
 */
@GetMapping("/exam/{examId}/total-marks")
ApiResponse<Integer> getTotalMarks(@PathVariable("examId") UUID examId);

/**
 * Get question statistics for an exam
 * Maps to: GET /api/questions/exam/{examId}/statistics
 */
@GetMapping("/exam/{examId}/statistics")
ApiResponse<QuestionStatisticsDTO> getExamStatistics(@PathVariable("examId") UUID examId);

/**
 * Validate if exam has valid questions for publishing
 * Maps to: GET /api/questions/exam/{examId}/validate
 */
@GetMapping("/exam/{examId}/validate")
ApiResponse<Boolean> validateExamQuestions(@PathVariable("examId") UUID examId);
}
