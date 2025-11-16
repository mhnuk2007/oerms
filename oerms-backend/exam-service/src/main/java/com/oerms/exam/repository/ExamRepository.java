package com.oerms.exam.repository;

import com.oerms.exam.entity.Exam;
import com.oerms.exam.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Page<Exam> findByTeacherId(Long teacherId, Pageable pageable);
    
    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);
    
    Page<Exam> findByStatusAndIsActive(ExamStatus status, Boolean isActive, Pageable pageable);
    
    List<Exam> findByTeacherIdAndStatus(Long teacherId, ExamStatus status);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' AND e.isActive = true " +
           "AND (e.startTime IS NULL OR e.startTime <= :now) " +
           "AND (e.endTime IS NULL OR e.endTime >= :now)")
    List<Exam> findActiveExams(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND e.endTime IS NOT NULL AND e.endTime < :now")
    List<Exam> findExpiredExams(@Param("now") LocalDateTime now);
    
    @Query("SELECT e FROM Exam e WHERE e.status = 'PUBLISHED' " +
           "AND e.startTime IS NOT NULL AND e.startTime <= :now " +
           "AND e.endTime IS NOT NULL AND e.endTime >= :now")
    List<Exam> findOngoingExams(@Param("now") LocalDateTime now);
    
    Optional<Exam> findByIdAndTeacherId(Long id, Long teacherId);
    
    Long countByTeacherId(Long teacherId);
    
    Long countByStatus(ExamStatus status);
}