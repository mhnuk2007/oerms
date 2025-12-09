package com.oerms.question.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.question.dto.*;
import com.oerms.question.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Create a new question", description = "Creates a new question for an exam")
    public ResponseEntity<ApiResponse<QuestionDTO>> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
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
        List<QuestionDTO> questions = questionService.getExamQuestions(examId);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @GetMapping("/exam/{examId}/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam questions for students", description = "Retrieves questions without answers for students")
    public ResponseEntity<ApiResponse<List<StudentQuestionDTO>>> getExamQuestionsForStudent(
            @PathVariable UUID examId,
            @RequestParam(defaultValue = "false") boolean shuffle) {
        List<StudentQuestionDTO> questions =
                questionService.getExamQuestionsForStudent(examId, shuffle);
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved successfully", questions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get a single question", description = "Retrieves a question by ID")
    public ResponseEntity<ApiResponse<QuestionDTO>> getQuestion(@PathVariable UUID id) {
        QuestionDTO question = questionService.getQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question retrieved successfully", question));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Update a question", description = "Updates an existing question")
    public ResponseEntity<ApiResponse<QuestionDTO>> updateQuestion(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateQuestionRequest request,
            Authentication authentication) {
        QuestionDTO question = questionService.updateQuestion(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Delete a question", description = "Deletes a question from an exam")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable UUID id,
            Authentication authentication) {
        questionService.deleteQuestion(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Bulk create questions", description = "Creates multiple questions at once")
    public ResponseEntity<ApiResponse<List<QuestionDTO>>> bulkCreateQuestions(
            @Valid @RequestBody BulkCreateQuestionsRequest request,
            Authentication authentication) {
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
        questionService.deleteAllExamQuestions(examId, authentication);
        return ResponseEntity.ok(ApiResponse.success("All questions deleted successfully", null));
    }

    @GetMapping("/exam/{examId}/count")
    @Operation(summary = "Get question count", description = "Returns the total number of questions for an exam")
    public ResponseEntity<ApiResponse<Long>> getQuestionCount(@PathVariable UUID examId) {
        Long count = questionService.getQuestionCount(examId);
        return ResponseEntity.ok(ApiResponse.success("Question count retrieved successfully", count));
    }

    @GetMapping("/exam/{examId}/total-marks")
    @Operation(summary = "Get total marks", description = "Returns the sum of all question marks for an exam")
    public ResponseEntity<ApiResponse<Integer>> getTotalMarks(@PathVariable UUID examId) {
        Integer totalMarks = questionService.getTotalMarks(examId);
        return ResponseEntity.ok(ApiResponse.success("Total marks retrieved successfully", totalMarks));
    }

    @GetMapping("/exam/{examId}/statistics")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam question statistics", description = "Returns detailed statistics about questions (count by type, difficulty, etc.)")
    public ResponseEntity<ApiResponse<QuestionStatisticsDTO>> getExamStatistics(
            @PathVariable UUID examId) {
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
        List<QuestionDTO> questions = questionService.reorderQuestions(examId, questionIds, authentication);
        return ResponseEntity.ok(ApiResponse.success("Questions reordered successfully", questions));
    }

    // New endpoints for better API design

    @GetMapping("/exam/{examId}/validate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Validate exam questions", description = "Checks if exam has valid questions for publishing")
    public ResponseEntity<ApiResponse<Boolean>> validateExamQuestions(@PathVariable UUID examId) {
        Long count = questionService.getQuestionCount(examId);
        boolean isValid = count > 0;
        return ResponseEntity.ok(ApiResponse.success("Validation completed", isValid));
    }

    @GetMapping("/exam/{examId}/summary")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Get exam questions summary", description = "Returns summary information about exam questions")
    public ResponseEntity<ApiResponse<QuestionSummaryDTO>> getExamQuestionsSummary(@PathVariable UUID examId) {
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