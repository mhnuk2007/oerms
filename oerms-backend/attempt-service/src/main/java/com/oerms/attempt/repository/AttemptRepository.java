package com.oerms.attempt.repository;

import com.oerms.attempt.entity.ExamAttempt;
import com.oerms.attempt.enums.AttemptStatus;
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
public interface AttemptRepository extends JpaRepository<ExamAttempt, UUID> {

    Page<ExamAttempt> findByStudentId(UUID studentId, Pageable pageable);
    Page<ExamAttempt> findByExamId(UUID examId, Pageable pageable);
    Page<ExamAttempt> findByExamIdAndStudentId(UUID examId, UUID studentId, Pageable pageable);

    List<ExamAttempt> findByExamIdAndStudentIdOrderByAttemptNumberDesc(UUID examId, UUID studentId);
    Optional<ExamAttempt> findByExamIdAndStudentIdAndStatus(UUID examId, UUID studentId, AttemptStatus status);

    long countByExamIdAndStudentId(UUID examId, UUID studentId);
    long countByExamId(UUID examId);
    long countByStudentId(UUID studentId);
    Page<ExamAttempt> findByStatus(AttemptStatus status, Pageable pageable);

    // ✔ Required for statistics
    List<ExamAttempt> findAllByExamId(UUID examId);

    @Query("SELECT a FROM ExamAttempt a WHERE a.status = 'IN_PROGRESS' AND a.startedAt < :cutoffTime")
    List<ExamAttempt> findStalledAttempts(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT AVG(a.obtainedMarks) FROM ExamAttempt a WHERE a.examId = :examId AND a.status = 'COMPLETED'")
    Double getAverageScoreByExamId(@Param("examId") UUID examId);

    @Query("SELECT a FROM ExamAttempt a WHERE a.examId = :examId ORDER BY a.obtainedMarks DESC")
    List<ExamAttempt> findTopScoresByExamId(@Param("examId") UUID examId, Pageable pageable);
}
