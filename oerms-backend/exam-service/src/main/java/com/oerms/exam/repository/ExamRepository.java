package com.oerms.exam.repository;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.enums.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExamRepository extends JpaRepository<Exam, UUID> {
    
    // ==================== Basic Query Methods ====================
    
    Page<Exam> findByTeacherId(UUID teacherId, Pageable pageable);
    
    Page<Exam> findByStatusAndIsActive(ExamStatus status, Boolean isActive, Pageable pageable);
    
    Long countByTeacherId(UUID teacherId);
    
    Long countByStatus(ExamStatus status);
    
    Page<Exam> findBySubject(String subject, Pageable pageable);
    
    Page<Exam> findByIsTemplate(Boolean isTemplate, Pageable pageable);
    
    // ==================== Time-based Query Methods ====================
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND (:now BETWEEN e.startTime AND e.endTime OR (e.startTime IS NULL OR e.endTime IS NULL))")
    List<Exam> findActiveExams(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND e.endTime < :now")
    List<Exam> findExpiredExams(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND e.startTime >= :startTime " +
            "AND e.startTime <= :endTime")
    List<Exam> findUpcomingExams(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // ==================== Auto-start Query (Corrected) ====================

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND e.startTime <= :now " +
            "AND e.startTime >= :oneMinuteAgo")
    List<Exam> findExamsToStartWithinWindow(
            @Param("now") LocalDateTime now,
            @Param("oneMinuteAgo") LocalDateTime oneMinuteAgo);

    /**
     * Helper method
     */
    default List<Exam> findExamsToStart(LocalDateTime now) {
        return findExamsToStartWithinWindow(now, now.minusMinutes(1));
    }

    // ==================== Old / Cleanup Queries ====================

    @Query("SELECT e FROM Exam e WHERE e.status = 'COMPLETED' " +
            "AND e.endTime < :threshold")
    List<Exam> findOldCompletedExams(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT e FROM Exam e WHERE e.status = 'CANCELLED' " +
            "AND e.updatedAt < :threshold")
    List<Exam> findOldCancelledExams(@Param("threshold") LocalDateTime threshold);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND e.startTime <= :now AND (e.endTime IS NULL OR e.endTime >= :now)")
    List<Exam> findOngoingExams(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND (e.startTime IS NULL OR e.startTime <= :now) " +
           "AND (e.endTime IS NULL OR e.endTime >= :now)")
    Page<Exam> findAvailableExamsForStudent(@Param("now") LocalDateTime now, Pageable pageable);
    

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND e.endTime BETWEEN :now AND :endTime ORDER BY e.endTime ASC")
    List<Exam> findExamsEndingSoon(@Param("now") LocalDateTime now, @Param("endTime") LocalDateTime endTime);
    
    // ==================== Advanced Search Method ====================
    
    @Query("SELECT e FROM Exam e WHERE " +
           "(:title IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:subject IS NULL OR LOWER(e.subject) = LOWER(:subject)) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:teacherId IS NULL OR e.teacherId = :teacherId) AND " +
           "(:minDuration IS NULL OR e.duration >= :minDuration) AND " +
           "(:maxDuration IS NULL OR e.duration <= :maxDuration) AND " +
           "(:startDate IS NULL OR e.startTime >= :startDate) AND " +
           "(:endDate IS NULL OR e.endTime <= :endDate) AND " +
           "(:minTotalMarks IS NULL OR e.totalMarks >= :minTotalMarks) AND " +
           "(:maxTotalMarks IS NULL OR e.totalMarks <= :maxTotalMarks) AND " +
           "(:isActive IS NULL OR e.isActive = :isActive)")
    Page<Exam> searchExams(
            @Param("title") String title,
            @Param("subject") String subject,
            @Param("status") ExamStatus status,
            @Param("teacherId") UUID teacherId,
            @Param("minDuration") Integer minDuration,
            @Param("maxDuration") Integer maxDuration,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minTotalMarks") Integer minTotalMarks,
            @Param("maxTotalMarks") Integer maxTotalMarks,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
    
    // ==================== Conflict Detection ====================
    
    @Query("SELECT e FROM Exam e WHERE e.id != :examId " +
           "AND e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND ((e.startTime BETWEEN :startTime AND :endTime) " +
           "OR (e.endTime BETWEEN :startTime AND :endTime) " +
           "OR (e.startTime <= :startTime AND e.endTime >= :endTime))")
    List<Exam> findConflictingExams(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("examId") UUID examId);
}