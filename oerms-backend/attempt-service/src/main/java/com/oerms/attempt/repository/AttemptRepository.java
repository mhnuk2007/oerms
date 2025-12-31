package com.oerms.attempt.repository;

import com.oerms.attempt.entity.ExamAttempt;
import com.oerms.common.enums.AttemptStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<ExamAttempt, UUID> {
    
    // Existing methods
    Page<ExamAttempt> findByStudentId(UUID studentId, Pageable pageable);
    Page<ExamAttempt> findByExamIdAndStudentId(UUID examId, UUID studentId, Pageable pageable);
    Page<ExamAttempt> findByExamId(UUID examId, Pageable pageable);
    Long countByStudentId(UUID studentId);
    Long countByExamId(UUID examId);
    Long countByExamIdAndStudentId(UUID examId, UUID studentId);
    
    @Query("SELECT a FROM ExamAttempt a WHERE a.examId = :examId AND a.studentId = :studentId " +
           "AND a.status = 'IN_PROGRESS'")
    Optional<ExamAttempt> findActiveAttemptForStudent(
            @Param("examId") UUID examId, 
            @Param("studentId") UUID studentId);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM ExamAttempt a WHERE a.id = :id")
    Optional<ExamAttempt> findByIdWithLock(@Param("id") UUID id);
    
    @Query("SELECT a FROM ExamAttempt a WHERE a.status = 'IN_PROGRESS' " +
           "AND a.startedAt < :cutoffTime")
    List<ExamAttempt> findStalledAttempts(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // New methods
    
    List<ExamAttempt> findByExamId(UUID examId);
    
    @Query("SELECT a FROM ExamAttempt a WHERE " +
           "(a.tabSwitches > 5 OR a.webcamViolations > 3 OR a.flaggedAsSuspicious = true)")
    Page<ExamAttempt> findSuspiciousAttempts(Pageable pageable);
    
    @Query("SELECT a FROM ExamAttempt a WHERE a.examId = :examId AND " +
           "(a.tabSwitches > 5 OR a.webcamViolations > 3 OR a.flaggedAsSuspicious = true)")
    List<ExamAttempt> findSuspiciousAttemptsByExam(@Param("examId") UUID examId);
    
    @Query("SELECT a FROM ExamAttempt a WHERE " +
           "(:examId IS NULL OR a.examId = :examId) AND " +
           "(:studentId IS NULL OR a.studentId = :studentId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:suspicious IS NULL OR (CASE WHEN (a.tabSwitches > 5 OR a.webcamViolations > 3 OR a.flaggedAsSuspicious = true) THEN true ELSE false END) = :suspicious) AND " +
           "(:startDate IS NULL OR a.startedAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.startedAt <= :endDate)")
    Page<ExamAttempt> searchAttempts(
            @Param("examId") UUID examId,
            @Param("studentId") UUID studentId,
            @Param("status") AttemptStatus status,
            @Param("suspicious") Boolean suspicious,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
