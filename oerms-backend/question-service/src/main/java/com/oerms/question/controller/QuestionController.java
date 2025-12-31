package com.oerms.question.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.question.dto.*;
import com.oerms.question.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Tag(name = "Question Management", description = "APIs for managing exam questions")
@Slf4j
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create a new question", description = "Creates a new question for an exam")
    public ResponseEntity<ApiResponse<QuestionDTO>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
        log.info("Received request to create question for examId: {}", request.getExamId());
        QuestionDTO question = questionService.createQuestion(request, authentication);
        return new ResponseEntity<>(
                ApiResponse.success("Question created successfully", question),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get all questions for an exam", description = "Retrieves all questions including answers (for teachers/admins)")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getExamQuestions(
            @PathVariable UUID examId) {
        log.info("Received request to get all questions for examId: {}", examId);
        List<QuestionDTO> questions = questionService.getExamQuestions(examId);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @GetMapping("/exam/{examId}/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam questions for students", description = "Retrieves questions without answers for students")
    public ResponseEntity<ApiResponse<List<StudentQuestionDTO>>> getExamQuestionsForStudent(
            @PathVariable UUID examId,
            @RequestParam(defaultValue = "false") boolean shuffle) {
        log.info("Received request to get student questions for examId: {}, shuffle: {}", examId, shuffle);
        List<StudentQuestionDTO> questions =
                questionService.getExamQuestionsForStudent(examId, shuffle);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get a single question", description = "Retrieves a question by ID")
    public ResponseEntity<ApiResponse<QuestionDTO>> getQuestion(@PathVariable UUID id) {
        log.info("Received request to get question by id: {}", id);
        QuestionDTO question = questionService.getQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question retrieved successfully", question));
    }

    @PostMapping("/internal/batch")
    @PreAuthorize("hasAuthority('SCOPE_internal')") // Corrected to check for the scope
    @Operation(summary = "Get questions for grading", description = "Retrieves a batch of questions by their IDs for internal grading use")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> getQuestionsForGrading(@RequestBody List<UUID> questionIds) {
        log.info("Received internal request to get {} questions by IDs for grading.", questionIds.size());
        List<QuestionDTO> questions = questionService.getQuestionsByIds(questionIds);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully for grading", questions));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update a question", description = "Updates an existing question")
    public ResponseEntity<ApiResponse<QuestionDTO>> updateQuestion(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuestionRequest request,
            Authentication authentication) {
        log.info("Received request to update questionId: {}", id);
        QuestionDTO question = questionService.updateQuestion(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete a question", description = "Deletes a question from an exam")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Received request to delete questionId: {}", id);
        questionService.deleteQuestion(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
    @PostMapping("/exam/{sourceExamId}/duplicate/{targetExamId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN') or hasAuthority('SCOPE_internal')")
    @Operation(
            summary = "Duplicate exam questions",
            description = "Copies all questions from source exam to target exam (for exam duplication and templates)"
    )
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> duplicateExamQuestions(
            @PathVariable UUID sourceExamId,
            @PathVariable UUID targetExamId,
            Authentication authentication) {
        log.info("Received request to duplicate questions from exam {} to exam {}",
                sourceExamId, targetExamId);

        List<QuestionDTO> duplicatedQuestions = questionService.duplicateExamQuestions(
                sourceExamId, targetExamId, authentication);

        return ResponseEntity.ok(ApiResponse.success(
                "Questions duplicated successfully",
                duplicatedQuestions));
    }



@PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk create questions", description = "Creates multiple questions at once")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> bulkCreateQuestions(
            @Valid @RequestBody BulkCreateQuestionsRequest request,
            Authentication authentication) {
        log.info("Received request to bulk create {} questions.", request.getQuestions().size());
        List<QuestionDTO> questions = questionService.bulkCreateQuestions(request, authentication);
        return new ResponseEntity<>(
                ApiResponse.success("Questions created successfully", questions),
                HttpStatus.CREATED
        );
    }

    @DeleteMapping("/exam/{examId}/all")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete all questions for an exam", description = "Deletes all questions from an exam")
    public ResponseEntity<ApiResponse<Void>> deleteAllExamQuestions(
            @PathVariable UUID examId,
            Authentication authentication) {
        log.info("Received request to delete all questions for examId: {}", examId);
        questionService.deleteAllExamQuestions(examId, authentication);
        return ResponseEntity.ok(ApiResponse.success("All questions deleted successfully", null));
    }

    @GetMapping("/exam/{examId}/count")
    @Operation(summary = "Get question count", description = "Returns the total number of questions for an exam")
    public ResponseEntity<ApiResponse<Long>> getQuestionCount(@PathVariable UUID examId) {
        log.debug("Received request for question count for examId: {}", examId);
        Long count = questionService.getQuestionCount(examId);
        return ResponseEntity.ok(ApiResponse.success("Question count retrieved successfully", count));
    }

    @GetMapping("/exam/{examId}/total-marks")
    @Operation(summary = "Get total marks", description = "Returns the sum of all question marks for an exam")
    public ResponseEntity<ApiResponse<Integer>> getTotalMarks(@PathVariable UUID examId) {
        log.debug("Received request for total marks for examId: {}", examId);
        Integer totalMarks = questionService.getTotalMarks(examId);
        return ResponseEntity.ok(ApiResponse.success("Total marks retrieved successfully", totalMarks));
    }

    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam question statistics", description = "Returns detailed statistics about questions (count by type, difficulty, etc.)")
    public ResponseEntity<ApiResponse<QuestionStatisticsDTO>> getExamStatistics(
            @PathVariable UUID examId) {
        log.info("Received request for question statistics for examId: {}", examId);
        QuestionStatisticsDTO stats = questionService.getExamStatistics(examId);
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    }

    @PutMapping("/exam/{examId}/reorder")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Reorder questions", description = "Changes the display order of questions in an exam")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> reorderQuestions(
            @PathVariable UUID examId,
            @RequestBody List<UUID> questionIds,
            Authentication authentication) {
        log.info("Received request to reorder {} questions for examId: {}", questionIds.size(), examId);
        List<QuestionDTO> questions = questionService.reorderQuestions(examId, questionIds, authentication);
        return ResponseEntity.ok(ApiResponse.success("Questions reordered successfully", questions));
    }

    @GetMapping("/exam/{examId}/validate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Validate exam questions", description = "Checks if exam has valid questions for publishing")
    public ResponseEntity<ApiResponse<Boolean>> validateExamQuestions(@PathVariable UUID examId) {
        log.info("Received request to validate questions for examId: {}", examId);
        Long count = questionService.getQuestionCount(examId);
        boolean isValid = count > 0;
        return ResponseEntity.ok(ApiResponse.success("Validation completed", isValid));
    }

    @GetMapping("/exam/{examId}/summary")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam questions summary", description = "Returns summary information about exam questions")
    public ResponseEntity<ApiResponse<QuestionSummaryDTO>> getExamQuestionsSummary(@PathVariable UUID examId) {
        log.info("Received request for question summary for examId: {}", examId);
        Long count = questionService.getQuestionCount(examId);
        Integer totalMarks = questionService.getTotalMarks(examId);
        QuestionStatisticsDTO stats = questionService.getExamStatistics(examId);

        QuestionSummaryDTO summary = QuestionSummaryDTO.builder()
                .examId(examId)
                .totalQuestions(count)
                .totalMarks(totalMarks)
                .statistics(stats)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Summary retrieved successfully", summary));
    }
}
