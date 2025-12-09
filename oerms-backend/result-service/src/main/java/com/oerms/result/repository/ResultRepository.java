package com.oerms.result.repository;

import com.oerms.result.entity.Result;
import com.oerms.result.enums.ResultStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResultRepository extends JpaRepository<Result, UUID> {
    
    Optional<Result> findByAttemptId(UUID attemptId);
    
    Page<Result> findByStudentId(UUID studentId, Pageable pageable);
    List<Result> findByStudentIdAndStatus(UUID studentId, ResultStatus status);
    
    Page<Result> findByExamId(UUID examId, Pageable pageable);
    List<Result> findByExamIdAndStatus(UUID examId, ResultStatus status);
    List<Result> findAllByExamId(UUID examId);
    
    Page<Result> findByStatus(ResultStatus status, Pageable pageable);
    
    long countByExamId(UUID examId);
    long countByStudentId(UUID studentId);
    long countByStatus(ResultStatus status);
    long countByExamIdAndStatus(UUID examId, ResultStatus status);
    long countByExamIdAndPassed(UUID examId, boolean passed);
    
    @Query("SELECT r FROM Result r WHERE r.requiresManualGrading = true AND r.status = 'PENDING_GRADING'")
    List<Result> findPendingGrading();
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.requiresManualGrading = true AND r.status = 'PENDING_GRADING'")
    List<Result> findPendingGradingByExam(@Param("examId") UUID examId);
    
    @Query("SELECT AVG(r.obtainedMarks) FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED'")
    Double getAverageScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT MAX(r.obtainedMarks) FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED'")
    Double getHighestScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT MIN(r.obtainedMarks) FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED'")
    Double getLowestScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED'")
    Double getAveragePercentageByExam(@Param("examId") UUID examId);
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED' ORDER BY r.obtainedMarks DESC")
    List<Result> findTopScoresByExam(@Param("examId") UUID examId, Pageable pageable);
    
    @Query("SELECT r.grade, COUNT(r) FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED' GROUP BY r.grade")
    List<Object[]> getGradeDistribution(@Param("examId") UUID examId);
    
    @Query("SELECT AVG(r.obtainedMarks) FROM Result r WHERE r.studentId = :studentId AND r.status = 'PUBLISHED'")
    Double getStudentAverageScore(@Param("studentId") UUID studentId);
    
    @Query("SELECT r FROM Result r WHERE r.studentId = :studentId AND r.status = 'PUBLISHED' ORDER BY r.publishedAt DESC")
    List<Result> findRecentResultsByStudent(@Param("studentId") UUID studentId, Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.suspiciousActivity = true OR r.tabSwitches > 5 OR r.webcamViolations > 3")
    List<Result> findSuspiciousResults();
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND (r.suspiciousActivity = true OR r.tabSwitches > 5 OR r.webcamViolations > 3)")
    List<Result> findSuspiciousResultsByExam(@Param("examId") UUID examId);
}