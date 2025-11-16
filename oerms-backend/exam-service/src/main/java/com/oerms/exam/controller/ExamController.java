package com.oerms.exam.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.exam.dto.CreateExamRequest;
import com.oerms.exam.dto.ExamDTO;
import com.oerms.exam.dto.UpdateExamRequest;
import com.oerms.exam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> createExam(
            @Valid @RequestBody CreateExamRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is creating an exam with data: {}", jwt.getSubject(), request);
        ExamDTO exam = examService.createExam(request);
        log.info("Exam '{}' created successfully by user '{}'", exam.getTitle(), jwt.getSubject());

        return new ResponseEntity<>(
                ApiResponse.success("Exam created successfully", exam),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ExamDTO>> getExam(@PathVariable Long id,
                                                        @AuthenticationPrincipal Jwt jwt) {
        log.debug("User '{}' is fetching exam with ID: {}", jwt.getSubject(), id);
        ExamDTO exam = examService.getExam(id);
        log.info("Exam fetched successfully: ID {}", id);
        return ResponseEntity.ok(ApiResponse.success(exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExamRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is updating Exam ID {} with data: {}", jwt.getSubject(), id, request);
        ExamDTO exam = examService.updateExam(id, request);
        log.info("Exam ID {} updated successfully by user '{}'", id, jwt.getSubject());

        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", exam));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id,
                                                        @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is deleting Exam ID {}", jwt.getSubject(), id);
        examService.deleteExam(id);
        log.info("Exam ID {} deleted successfully by user '{}'", id, jwt.getSubject());

        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> publishExam(@PathVariable Long id,
                                                            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is publishing Exam ID {}", jwt.getSubject(), id);
        ExamDTO exam = examService.publishExam(id);
        log.info("Exam ID {} published successfully by user '{}'", id, jwt.getSubject());

        return ResponseEntity.ok(ApiResponse.success("Exam published successfully", exam));
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> unpublishExam(@PathVariable Long id,
                                                              @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is unpublishing Exam ID {}", jwt.getSubject(), id);
        ExamDTO exam = examService.unpublishExam(id);
        log.info("Exam ID {} unpublished successfully by user '{}'", id, jwt.getSubject());

        return ResponseEntity.ok(ApiResponse.success("Exam unpublished successfully", exam));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamDTO>> archiveExam(@PathVariable Long id,
                                                            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is archiving Exam ID {}", jwt.getSubject(), id);
        ExamDTO exam = examService.archiveExam(id);
        log.info("Exam ID {} archived successfully by user '{}'", id, jwt.getSubject());

        return ResponseEntity.ok(ApiResponse.success("Exam archived successfully", exam));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getTeacherExams(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is fetching exams for Teacher ID {} | page={}, size={}, sortBy={}, sortDir={}",
                jwt.getSubject(), teacherId, page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getTeacherExams(
                teacherId, PageRequest.of(page, size, sort));

        log.info("Fetched {} exams for Teacher ID {}", exams.getContent().size(), teacherId);
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<PageResponse<ExamDTO>>> getPublishedExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is fetching published exams | page={}, size={}, sortBy={}, sortDir={}",
                jwt == null ? "anonymous" : jwt.getSubject(), page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        PageResponse<ExamDTO> exams = examService.getPublishedExams(
                PageRequest.of(page, size, sort));

        log.info("Fetched {} published exams", exams.getContent().size());
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getActiveExams(@AuthenticationPrincipal Jwt jwt) {
        log.debug("User '{}' is fetching active exams", jwt == null ? "anonymous" : jwt.getSubject());
        List<ExamDTO> exams = examService.getActiveExams();
        log.info("Fetched {} active exams", exams.size());
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/ongoing")
    public ResponseEntity<ApiResponse<List<ExamDTO>>> getOngoingExams(@AuthenticationPrincipal Jwt jwt) {
        log.debug("User '{}' is fetching ongoing exams", jwt == null ? "anonymous" : jwt.getSubject());
        List<ExamDTO> exams = examService.getOngoingExams();
        log.info("Fetched {} ongoing exams", exams.size());
        return ResponseEntity.ok(ApiResponse.success(exams));
    }

    @GetMapping("/teacher/{teacherId}/count")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTeacherExamCount(@PathVariable Long teacherId,
                                                                 @AuthenticationPrincipal Jwt jwt) {

        log.debug("User '{}' is fetching exam count for Teacher ID {}", jwt.getSubject(), teacherId);
        Long count = examService.getTeacherExamCount(teacherId);
        log.info("Teacher ID {} has {} exams", teacherId, count);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/published/count")
    public ResponseEntity<ApiResponse<Long>> getPublishedExamCount(@AuthenticationPrincipal Jwt jwt) {
        log.debug("User '{}' is fetching published exam count", jwt == null ? "anonymous" : jwt.getSubject());
        Long count = examService.getPublishedExamCount();
        log.info("Published exams count: {}", count);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
