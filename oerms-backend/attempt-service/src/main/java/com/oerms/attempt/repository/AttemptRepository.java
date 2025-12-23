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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<ExamAttempt, UUID> {

    Page<ExamAttempt> findByStudentId(UUID studentId, Pageable pageable);
    Page<ExamAttempt> findByExamId(UUID examId, Pageable pageable);
    Page<ExamAttempt> findByExamIdAndStudentId(UUID examId, UUID studentId, Pageable pageable);

    List<ExamAttempt> findByExamIdAndStudentIdOrderByAttemptNumberDesc(UUID examId, UUID studentId);

    // Pessimistic lock to prevent duplicate IN_PROGRESS attempts
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT a FROM ExamAttempt a
        WHERE a.examId = :examId
          AND a.studentId = :studentId
          AND a.status = 'IN_PROGRESS'
          AND a.deleted = false
        ORDER BY a.startedAt DESC
        """)
    Optional<ExamAttempt> findActiveAttemptForStudent(
            @Param("examId") UUID examId,
            @Param("studentId") UUID studentId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM ExamAttempt a WHERE a.id = :id")
    Optional<ExamAttempt> findByIdWithLock(@Param("id") UUID id);

    long countByExamIdAndStudentId(UUID examId, UUID studentId);
    long countByExamId(UUID examId);
    long countByStudentId(UUID studentId);
    Page<ExamAttempt> findByStatus(AttemptStatus status, Pageable pageable);

    List<ExamAttempt> findAllByExamId(UUID examId);

    @Query(value = "SELECT * FROM exam_attempts a WHERE a.status = 'IN_PROGRESS' AND a.started_at + (a.exam_duration_in_minutes * INTERVAL '1 minute') < NOW()", nativeQuery = true)
    List<ExamAttempt> findStalledAttempts();


}
