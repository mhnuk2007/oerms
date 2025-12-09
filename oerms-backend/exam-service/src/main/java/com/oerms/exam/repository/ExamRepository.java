package com.oerms.exam.repository;

import com.oerms.exam.entity.Exam;
import com.oerms.common.enums.ExamStatus;
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

    // ==================== Basic Queries ====================

    Page<Exam> findByTeacherId(UUID teacherId, Pageable pageable);

    Page<Exam> findByStatusAndIsActive(ExamStatus status, Boolean isActive, Pageable pageable);

    Long countByTeacherId(UUID teacherId);

    Long countByStatus(ExamStatus status);

    // ==================== Date-based Queries ====================

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND (e.startTime IS NULL OR e.startTime <= :now) " +
            "AND (e.endTime IS NULL OR e.endTime >= :now)")
    List<Exam> findActiveExams(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND e.startTime <= :now " +
            "AND e.endTime >= :now")
    List<Exam> findOngoingExams(@Param("now") LocalDateTime now);

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

    /**
     * Find exams that should start within the last 1 minute
     */
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

    // ==================== Search Queries ====================

    @Query("SELECT e FROM Exam e WHERE " +
            "LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Exam> searchExams(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
            "AND e.isActive = true " +
            "AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Exam> searchPublishedExams(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT e FROM Exam e WHERE e.teacherId = :teacherId " +
            "AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Exam> searchTeacherExams(
            @Param("teacherId") UUID teacherId,
            @Param("keyword") String keyword,
            Pageable pageable);

    // ==================== Statistics Queries ====================

    @Query("SELECT e.status, COUNT(e) FROM Exam e WHERE e.teacherId = :teacherId " +
            "GROUP BY e.status")
    List<Object[]> countExamsByStatusForTeacher(@Param("teacherId") UUID teacherId);

    @Query("SELECT e FROM Exam e WHERE e.status IN :statuses")
    List<Exam> findByStatusIn(@Param("statuses") List<ExamStatus> statuses);

    @Query("SELECT e FROM Exam e WHERE e.teacherId = :teacherId AND e.status = :status")
    Page<Exam> findByTeacherIdAndStatus(
            @Param("teacherId") UUID teacherId,
            @Param("status") ExamStatus status,
            Pageable pageable);

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.teacherId = :teacherId " +
            "AND e.status = 'PUBLISHED' AND e.isActive = true")
    Long countActiveExamsByTeacher(@Param("teacherId") UUID teacherId);
}
