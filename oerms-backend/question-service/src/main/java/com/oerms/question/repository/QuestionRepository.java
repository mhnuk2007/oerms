package com.oerms.question.repository;

import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.Question;
import com.oerms.question.entity.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    // ==================== Basic Query Methods ====================
    
    /**
     * Find all questions for an exam ordered by display order
     */
    List<Question> findByExamIdOrderByOrderIndexAsc(UUID examId);
    
    /**
     * Find questions by exam and type
     */
    List<Question> findByExamIdAndType(UUID examId, QuestionType type);
    
    /**
     * Find questions by exam and difficulty level
     */
    List<Question> findByExamIdAndDifficultyLevel(UUID examId, DifficultyLevel level);
    
    /**
     * Find a specific question by ID and exam ID (for ownership verification)
     */
    Optional<Question> findByIdAndExamId(UUID id, UUID examId);
    
    /**
     * Find all questions by their IDs (for batch operations)
     */
    List<Question> findByIdIn(List<UUID> ids);
    
    // ==================== Count Methods ====================
    
    /**
     * Count total questions in an exam
     */
    Long countByExamId(UUID examId);
    
    /**
     * Count questions by type in an exam
     */
    Long countByExamIdAndType(UUID examId, QuestionType type);
    
    /**
     * Count questions by difficulty level in an exam
     */
    Long countByExamIdAndDifficultyLevel(UUID examId, DifficultyLevel level);
    
    // ==================== Aggregate Queries ====================
    
    /**
     * Calculate total marks for all questions in an exam
     */
    @Query("SELECT COALESCE(SUM(q.marks), 0) FROM Question q WHERE q.examId = :examId")
    Integer sumMarksByExamId(@Param("examId") UUID examId);
    
    /**
     * Get the maximum display order in an exam (for adding new questions)
     */
    @Query("SELECT COALESCE(MAX(q.orderIndex), 0) FROM Question q WHERE q.examId = :examId")
    Integer findMaxOrderIndexByExamId(@Param("examId") UUID examId);
    
    /**
     * Get average marks per question in an exam
     */
    @Query("SELECT AVG(q.marks) FROM Question q WHERE q.examId = :examId")
    Double findAverageMarksByExamId(@Param("examId") UUID examId);
    
    // ==================== Statistics Queries ====================
    
    /**
     * Get question type distribution for an exam
     */
    @Query("SELECT q.type, COUNT(q) FROM Question q WHERE q.examId = :examId GROUP BY q.type")
    List<Object[]> countQuestionsByType(@Param("examId") UUID examId);
    
    /**
     * Get difficulty level distribution for an exam
     */
    @Query("SELECT q.difficultyLevel, COUNT(q) FROM Question q WHERE q.examId = :examId GROUP BY q.difficultyLevel")
    List<Object[]> countQuestionsByDifficulty(@Param("examId") UUID examId);
    
    /**
     * Get marks distribution by type
     */
    @Query("SELECT q.type, SUM(q.marks) FROM Question q WHERE q.examId = :examId GROUP BY q.type")
    List<Object[]> sumMarksByType(@Param("examId") UUID examId);
    
    // ==================== Delete Operations ====================
    
    /**
     * Delete all questions for an exam
     * Note: Should be used with @Transactional and @Modifying
     */
    @Modifying
    @Query("DELETE FROM Question q WHERE q.examId = :examId")
    void deleteByExamId(@Param("examId") UUID examId);
    
    /**
     * Delete questions by their IDs
     */
    @Modifying
    @Query("DELETE FROM Question q WHERE q.id IN :ids")
    void deleteByIdIn(@Param("ids") List<UUID> ids);
    
    // ==================== Existence Checks ====================
    
    /**
     * Check if an exam has any questions
     */
    boolean existsByExamId(UUID examId);
    
    /**
     * Check if a question exists with given ID and exam ID
     */
    boolean existsByIdAndExamId(UUID id, UUID examId);
    
    // ==================== Ordering Operations ====================
    
    /**
     * Find questions in a specific display order range
     */
    @Query("SELECT q FROM Question q WHERE q.examId = :examId AND q.orderIndex BETWEEN :startOrder AND :endOrder ORDER BY q.orderIndex ASC")
    List<Question> findByExamIdAndOrderIndexBetween(
        @Param("examId") UUID examId, 
        @Param("startOrder") Integer startOrder, 
        @Param("endOrder") Integer endOrder
    );
    
    /**
     * Update display order for a specific question
     */
    @Modifying
    @Query("UPDATE Question q SET q.orderIndex = :newOrder WHERE q.id = :questionId")
    void updateOrderIndex(@Param("questionId") UUID questionId, @Param("newOrder") Integer newOrder);
    
    // ==================== Search and Filter ====================
    
    /**
     * Search questions by text content
     */
    @Query("SELECT q FROM Question q WHERE q.examId = :examId AND LOWER(q.questionText) LIKE LOWER(CONCAT('%', :searchText, '%')) ORDER BY q.orderIndex ASC")
    List<Question> searchQuestionsByText(@Param("examId") UUID examId, @Param("searchText") String searchText);
    
    /**
     * Find questions with marks in a specific range
     */
    @Query("SELECT q FROM Question q WHERE q.examId = :examId AND q.marks BETWEEN :minMarks AND :maxMarks ORDER BY q.orderIndex ASC")
    List<Question> findByExamIdAndMarksBetween(
        @Param("examId") UUID examId, 
        @Param("minMarks") Integer minMarks, 
        @Param("maxMarks") Integer maxMarks
    );
    
    /**
     * Find questions by multiple criteria
     */
    @Query("SELECT q FROM Question q WHERE q.examId = :examId " +
           "AND (:type IS NULL OR q.type = :type) " +
           "AND (:difficulty IS NULL OR q.difficultyLevel = :difficulty) " +
           "AND (:minMarks IS NULL OR q.marks >= :minMarks) " +
           "AND (:maxMarks IS NULL OR q.marks <= :maxMarks) " +
           "ORDER BY q.orderIndex ASC")
    List<Question> findByMultipleCriteria(
        @Param("examId") UUID examId,
        @Param("type") QuestionType type,
        @Param("difficulty") DifficultyLevel difficulty,
        @Param("minMarks") Integer minMarks,
        @Param("maxMarks") Integer maxMarks
    );
    
    // ==================== Validation ====================
    
    /**
     * Check if all questions in an exam have valid marks
     */
    @Query("SELECT COUNT(q) > 0 FROM Question q WHERE q.examId = :examId AND (q.marks IS NULL OR q.marks <= 0)")
    boolean hasQuestionsWithInvalidMarks(@Param("examId") UUID examId);
    
    /**
     * Check if any question is missing correct answers (for MCQ/True-False)
     */
    @Query("SELECT COUNT(q) > 0 FROM Question q WHERE q.examId = :examId " +
           "AND q.type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_SELECT') " +
           "AND (q.correctAnswer IS NULL OR q.correctAnswer = '')")
    boolean hasQuestionsWithoutCorrectAnswers(@Param("examId") UUID examId);
}
