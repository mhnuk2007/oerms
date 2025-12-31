package com.oerms.result.repository;

import com.oerms.result.entity.Result;
import com.oerms.result.enums.ResultStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResultRepository extends JpaRepository<Result, UUID> {
    
    // Existing methods
    Optional<Result> findByAttemptId(UUID attemptId);
    Page<Result> findByStudentId(UUID studentId, Pageable pageable);
    Page<Result> findByStudentIdAndExamId(UUID studentId, UUID examId, Pageable pageable);
    Page<Result> findByExamId(UUID examId, Pageable pageable);
    Page<Result> findByStatus(ResultStatus status, Pageable pageable);
    List<Result> findByExamIdAndStudentId(UUID examId, UUID studentId);
    List<Result> findByExamIdAndStatus(UUID examId, ResultStatus status);
    Page<Result> findByStudentIdAndStatus(UUID studentId, ResultStatus status, Pageable pageable);
    
    Long countByStudentId(UUID studentId);
    Long countByStudentIdAndStatus(UUID studentId, ResultStatus status);
    Long countByExamId(UUID examId);
    Long countByExamIdAndStatus(UUID examId, ResultStatus status);
    Long countByExamIdAndPassed(UUID examId, Boolean passed);
    
    @Query("SELECT r FROM Result r WHERE r.status = 'PENDING_GRADING'")
    List<Result> findPendingGrading();
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.status = 'PENDING_GRADING'")
    List<Result> findPendingGradingByExam(@Param("examId") UUID examId);
    
    // New methods
    
    @Query("SELECT r FROM Result r WHERE " +
           "(:studentName IS NULL OR LOWER(r.studentName) LIKE LOWER(CONCAT('%', :studentName, '%'))) AND " +
           "(:examId IS NULL OR r.examId = :examId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:passed IS NULL OR r.passed = :passed) AND " +
           "(:minPercentage IS NULL OR r.percentage >= :minPercentage) AND " +
           "(:maxPercentage IS NULL OR r.percentage <= :maxPercentage)")
    Page<Result> searchResults(
            @Param("studentName") String studentName,
            @Param("examId") UUID examId,
            @Param("status") ResultStatus status,
            @Param("passed") Boolean passed,
            @Param("minPercentage") Double minPercentage,
            @Param("maxPercentage") Double maxPercentage,
            Pageable pageable);
    
    Page<Result> findBySubmittedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.submittedAt IS NOT NULL " +
           "ORDER BY r.submittedAt DESC")
    List<Result> findRecentlySubmitted(Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.gradedAt IS NOT NULL " +
           "ORDER BY r.gradedAt DESC")
    List<Result> findRecentlyGraded(Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.publishedAt IS NOT NULL " +
           "ORDER BY r.publishedAt DESC")
    List<Result> findRecentlyPublished(Pageable pageable);
    
    @Query("SELECT AVG(r.obtainedMarks) FROM Result r WHERE r.examId = :examId " +
           "AND r.status = 'PUBLISHED'")
    Double getAverageScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT MAX(r.obtainedMarks) FROM Result r WHERE r.examId = :examId " +
           "AND r.status = 'PUBLISHED'")
    Double getHighestScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT MIN(r.obtainedMarks) FROM Result r WHERE r.examId = :examId " +
           "AND r.status = 'PUBLISHED'")
    Double getLowestScoreByExam(@Param("examId") UUID examId);
    
    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.examId = :examId " +
           "AND r.status = 'PUBLISHED'")
    Double getAveragePercentageByExam(@Param("examId") UUID examId);
    
    @Query("SELECT r.grade, COUNT(r) FROM Result r WHERE r.examId = :examId " +
           "AND r.status = 'PUBLISHED' GROUP BY r.grade")
    List<Object[]> getGradeDistribution(@Param("examId") UUID examId);
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED' " +
           "ORDER BY r.obtainedMarks DESC")
    List<Result> findTopScoresByExam(@Param("examId") UUID examId, Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.status = 'PUBLISHED' " +
           "AND r.percentage < :threshold ORDER BY r.percentage ASC")
    List<Result> findLowPerformersByExam(
            @Param("examId") UUID examId, 
            @Param("threshold") Double threshold);
    
    @Query("SELECT r FROM Result r WHERE r.suspiciousActivity = true")
    List<Result> findSuspiciousResults();
    
    @Query("SELECT r FROM Result r WHERE r.examId = :examId AND r.suspiciousActivity = true")
    List<Result> findSuspiciousResultsByExam(@Param("examId") UUID examId);
    
    @Query("SELECT AVG(r.obtainedMarks) FROM Result r WHERE r.studentId = :studentId " +
           "AND r.status = 'PUBLISHED'")
    Double getStudentAverageScore(@Param("studentId") UUID studentId);
    
    @Query("SELECT r FROM Result r WHERE r.studentId = :studentId " +
           "AND r.status = 'PUBLISHED' ORDER BY r.submittedAt DESC")
    List<Result> findRecentResultsByStudent(@Param("studentId") UUID studentId, Pageable pageable);
    
    @Query("SELECT r FROM Result r WHERE r.studentId = :studentId " +
           "AND r.submittedAt BETWEEN :startDate AND :endDate " +
           "AND r.status = 'PUBLISHED' ORDER BY r.submittedAt ASC")
    List<Result> findStudentResultsInDateRange(
            @Param("studentId") UUID studentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
