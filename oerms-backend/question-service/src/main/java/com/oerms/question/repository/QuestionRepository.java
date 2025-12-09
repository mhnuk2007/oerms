package com.oerms.question.repository;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.Question;
import com.oerms.question.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByExamIdOrderByOrderIndexAsc(UUID examId);
    
    List<Question> findByExamIdAndType(UUID examId, QuestionType type);
    
    List<Question> findByExamIdAndDifficultyLevel(UUID examId, DifficultyLevel level);
    
    Optional<Question> findByIdAndExamId(UUID id, UUID examId);
    
    Long countByExamId(UUID examId);
    
    Long countByExamIdAndType(UUID examId, QuestionType type);
    
    Long countByExamIdAndDifficultyLevel(UUID examId, DifficultyLevel level);
    
    @Query("SELECT SUM(q.marks) FROM Question q WHERE q.examId = :examId")
    Integer sumMarksByExamId(@Param("examId") UUID examId);
    
    @Query("SELECT MAX(q.orderIndex) FROM Question q WHERE q.examId = :examId")
    Integer findMaxOrderIndexByExamId(@Param("examId") UUID examId);
    
    void deleteByExamId(UUID examId);
    
    boolean existsByExamId(UUID examId);
}