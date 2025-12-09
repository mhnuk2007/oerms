package com.oerms.question.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.common.util.JwtUtils;
import com.oerms.question.client.ExamServiceClient;
import com.oerms.question.dto.*;
import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.Question;
import com.oerms.question.entity.QuestionType;
import com.oerms.question.repository.QuestionRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamServiceClient examServiceClient;

    /**
     * Creates a new question for an exam
     *
     * @param request Question creation request
     * @param authentication Current user authentication
     * @return Created question DTO
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, key = "#request.examId")
    public QuestionDTO createQuestion(CreateQuestionRequest request, Authentication authentication) {
        // Verify exam exists and user has permission
        ExamDTO exam = getExamOrThrow(request.getExamId());
        log.debug("Creating question for exam: {} (Title: {}, Teacher: {})",
                exam.getId(), exam.getTitle(), exam.getTeacherId());

        verifyExamOwnership(exam, authentication);
        validateQuestion(request);

        // Calculate order index
        Integer maxOrderIndex = questionRepository.findMaxOrderIndexByExamId(request.getExamId());
        int orderIndex = request.getOrderIndex() != null
                ? request.getOrderIndex()
                : (maxOrderIndex != null ? maxOrderIndex + 1 : 1);

        // Build and save question
        Question question = Question.builder()
                .examId(request.getExamId())
                .questionText(request.getQuestionText())
                .type(request.getType())
                .marks(request.getMarks())
                .orderIndex(orderIndex)
                .options(request.getOptions())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .difficultyLevel(request.getDifficultyLevel())
                .imageUrl(request.getImageUrl())
                .build();

        question.setCreatedBy(JwtUtils.getUsername(authentication));
        question = questionRepository.save(question);

        log.info("Question created: {} for exam: {} by user: {}",
                question.getId(), request.getExamId(), JwtUtils.getUsername(authentication));

        return mapToDTO(question);
    }

    /**
     * Gets all questions for an exam (with answers - for teachers/admins)
     */
    @Cacheable(value = "examQuestions", key = "#examId")
    public List<QuestionDTO> getExamQuestions(UUID examId) {
        log.debug("Fetching questions for exam: {}", examId);
        List<Question> questions = questionRepository.findByExamIdOrderByOrderIndexAsc(examId);
        log.debug("Found {} questions for exam: {}", questions.size(), examId);
        return questions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Gets questions for students (without answers)
     */
    @Cacheable(value = "examQuestionsStudent", key = "#examId + '-' + #shuffle")
    public List<StudentQuestionDTO> getExamQuestionsForStudent(UUID examId, boolean shuffle) {
        log.debug("Fetching student questions for exam: {} (shuffle: {})", examId, shuffle);
        List<Question> questions = questionRepository.findByExamIdOrderByOrderIndexAsc(examId);
        List<StudentQuestionDTO> studentQuestions = questions.stream()
                .map(this::mapToStudentDTO)
                .collect(Collectors.toCollection(ArrayList::new));

        if (shuffle) {
            Collections.shuffle(studentQuestions);
            log.debug("Shuffled {} questions for exam: {}", studentQuestions.size(), examId);
        }

        return studentQuestions;
    }

    /**
     * Gets a single question by ID
     */
    public QuestionDTO getQuestion(UUID questionId) {
        log.debug("Fetching question: {}", questionId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));
        return mapToDTO(question);
    }

    /**
     * Updates an existing question
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, key = "#result.examId")
    public QuestionDTO updateQuestion(UUID questionId, UpdateQuestionRequest request, Authentication authentication) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));

        // Verify ownership
        ExamDTO exam = getExamOrThrow(question.getExamId());
        verifyExamOwnership(exam, authentication);

        // Update fields if provided
        if (request.getQuestionText() != null) {
            question.setQuestionText(request.getQuestionText());
        }
        if (request.getType() != null) {
            question.setType(request.getType());
        }
        if (request.getMarks() != null) {
            question.setMarks(request.getMarks());
        }
        if (request.getOrderIndex() != null) {
            question.setOrderIndex(request.getOrderIndex());
        }
        if (request.getOptions() != null) {
            question.setOptions(request.getOptions());
        }
        if (request.getCorrectAnswer() != null) {
            question.setCorrectAnswer(request.getCorrectAnswer());
        }
        if (request.getExplanation() != null) {
            question.setExplanation(request.getExplanation());
        }
        if (request.getDifficultyLevel() != null) {
            question.setDifficultyLevel(request.getDifficultyLevel());
        }
        if (request.getImageUrl() != null) {
            question.setImageUrl(request.getImageUrl());
        }

        // Validate updated question
        validateQuestionUpdate(question);

        question = questionRepository.save(question);
        log.info("Question updated: {} for exam: {} by user: {}",
                questionId, question.getExamId(), JwtUtils.getUsername(authentication));

        return mapToDTO(question);
    }

    /**
     * Deletes a question
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, allEntries = true)
    public void deleteQuestion(UUID questionId, Authentication authentication) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));

        // Verify ownership
        ExamDTO exam = getExamOrThrow(question.getExamId());
        verifyExamOwnership(exam, authentication);

        questionRepository.delete(question);
        log.info("Question deleted: {} from exam: {} by user: {}",
                questionId, question.getExamId(), JwtUtils.getUsername(authentication));
    }

    /**
     * Bulk creates multiple questions
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, allEntries = true)
    public List<QuestionDTO> bulkCreateQuestions(BulkCreateQuestionsRequest request, Authentication authentication) {
        log.info("Starting bulk creation of {} questions", request.getQuestions().size());

        List<QuestionDTO> createdQuestions = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < request.getQuestions().size(); i++) {
            CreateQuestionRequest questionRequest = request.getQuestions().get(i);
            try {
                QuestionDTO created = createQuestion(questionRequest, authentication);
                createdQuestions.add(created);
            } catch (Exception e) {
                String error = String.format("Failed to create question %d for exam %s: %s",
                        i + 1, questionRequest.getExamId(), e.getMessage());
                errors.add(error);
                log.error(error, e);
            }
        }

        log.info("Bulk creation completed: {} successful, {} failed",
                createdQuestions.size(), errors.size());

        if (!errors.isEmpty() && createdQuestions.isEmpty()) {
            throw new BadRequestException("All questions failed to create: " + String.join("; ", errors));
        }

        return createdQuestions;
    }

    /**
     * Deletes all questions for an exam
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, key = "#examId")
    public void deleteAllExamQuestions(UUID examId, Authentication authentication) {
        ExamDTO exam = getExamOrThrow(examId);
        verifyExamOwnership(exam, authentication);

        long count = questionRepository.countByExamId(examId);
        questionRepository.deleteByExamId(examId);

        log.info("Deleted {} questions for exam: {} by user: {}",
                count, examId, JwtUtils.getUsername(authentication));
    }

    /**
     * Gets total question count for an exam
     */
    public Long getQuestionCount(UUID examId) {
        Long count = questionRepository.countByExamId(examId);
        log.debug("Question count for exam {}: {}", examId, count);
        return count;
    }

    /**
     * Gets total marks for all questions in an exam
     */
    public Integer getTotalMarks(UUID examId) {
        Integer total = questionRepository.sumMarksByExamId(examId);
        int marks = total != null ? total : 0;
        log.debug("Total marks for exam {}: {}", examId, marks);
        return marks;
    }

    /**
     * Gets detailed statistics about exam questions
     */
    @Cacheable(value = "questionStatistics", key = "#examId")
    public QuestionStatisticsDTO getExamStatistics(UUID examId) {
        log.debug("Calculating statistics for exam: {}", examId);

        Long totalQuestions = questionRepository.countByExamId(examId);
        Integer totalMarks = getTotalMarks(examId);

        // Count by type
        Long mcqCount = questionRepository.countByExamIdAndType(examId, QuestionType.MCQ);
        Long trueFalseCount = questionRepository.countByExamIdAndType(examId, QuestionType.TRUE_FALSE);
        Long shortAnswerCount = questionRepository.countByExamIdAndType(examId, QuestionType.SHORT_ANSWER);
        Long essayCount = questionRepository.countByExamIdAndType(examId, QuestionType.ESSAY);

        // Count by difficulty
        Long easyCount = questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.EASY);
        Long mediumCount = questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.MEDIUM);
        Long hardCount = questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.HARD);

        QuestionStatisticsDTO stats = QuestionStatisticsDTO.builder()
                .examId(examId)
                .totalQuestions(totalQuestions)
                .totalMarks(totalMarks)
                .mcqCount(mcqCount)
                .trueFalseCount(trueFalseCount)
                .shortAnswerCount(shortAnswerCount)
                .essayCount(essayCount)
                .easyCount(easyCount)
                .mediumCount(mediumCount)
                .hardCount(hardCount)
                .build();

        log.debug("Statistics for exam {}: {} questions, {} marks", examId, totalQuestions, totalMarks);
        return stats;
    }

    /**
     * Reorders questions in an exam
     */
    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent"}, key = "#examId")
    public List<QuestionDTO> reorderQuestions(UUID examId, List<UUID> questionIds, Authentication authentication) {
        ExamDTO exam = getExamOrThrow(examId);
        verifyExamOwnership(exam, authentication);

        log.info("Reordering {} questions for exam: {}", questionIds.size(), examId);

        List<QuestionDTO> reordered = new ArrayList<>();
        for (int i = 0; i < questionIds.size(); i++) {
            UUID questionId = questionIds.get(i);
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Question not found: " + questionId));

            if (!question.getExamId().equals(examId)) {
                throw new BadRequestException(
                        "Question " + questionId + " does not belong to exam " + examId);
            }

            question.setOrderIndex(i + 1);
            question = questionRepository.save(question);
            reordered.add(mapToDTO(question));
        }

        log.info("Successfully reordered {} questions for exam: {}", questionIds.size(), examId);
        return reordered;
    }

    // ==================== Private Helper Methods ====================

    /**
     * Validates question creation request
     */
    private void validateQuestion(CreateQuestionRequest request) {
        // Validate MCQ/Multiple Answer
        if (request.getType() == QuestionType.MCQ || request.getType() == QuestionType.MULTIPLE_ANSWER) {
            if (request.getOptions() == null || request.getOptions().size() < 2) {
                throw new BadRequestException("MCQ questions must have at least 2 options");
            }
            if (request.getCorrectAnswer() == null || request.getCorrectAnswer().isBlank()) {
                throw new BadRequestException("MCQ questions must have a correct answer");
            }
        }

        // Validate True/False
        if (request.getType() == QuestionType.TRUE_FALSE) {
            if (request.getCorrectAnswer() == null || request.getCorrectAnswer().isBlank()) {
                throw new BadRequestException("True/False question must have an answer");
            }
            String answer = request.getCorrectAnswer().toUpperCase();
            if (!answer.equals("TRUE") && !answer.equals("FALSE")) {
                throw new BadRequestException("True/False question answer must be TRUE or FALSE");
            }
        }

        // Validate marks
        if (request.getMarks() <= 0) {
            throw new BadRequestException("Question marks must be greater than 0");
        }
    }

    /**
     * Validates question update
     */
    private void validateQuestionUpdate(Question question) {
        if (question.getType() == QuestionType.MCQ || question.getType() == QuestionType.MULTIPLE_ANSWER) {
            if (question.getOptions() == null || question.getOptions().size() < 2) {
                throw new BadRequestException("MCQ questions must have at least 2 options");
            }
        }

        if (question.getType() == QuestionType.TRUE_FALSE && question.getCorrectAnswer() != null) {
            String answer = question.getCorrectAnswer().toUpperCase();
            if (!answer.equals("TRUE") && !answer.equals("FALSE")) {
                throw new BadRequestException("True/False question answer must be TRUE or FALSE");
            }
        }
    }

    /**
     * Fetches exam from Exam Service via Feign
     */
    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            log.debug("Fetching exam {} from Exam Service", examId);
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);

            if (response != null && response.isSuccess() && response.getData() != null) {
                log.debug("Successfully fetched exam: {}", response.getData().getTitle());
                return response.getData();
            }

            log.warn("Exam {} not found or invalid response", examId);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);

        } catch (FeignException.NotFound e) {
            log.error("Exam {} not found in Exam Service", examId);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        } catch (FeignException e) {
            log.error("Feign error while fetching exam {}: {} - {}", examId, e.status(), e.getMessage());
            throw new BadRequestException("Unable to verify exam: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while fetching exam {}", examId, e);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
    }

    /**
     * Verifies that the current user owns the exam or is an admin
     */
    private void verifyExamOwnership(ExamDTO exam, Authentication authentication) {
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        log.debug("Verifying exam ownership - Exam Teacher: {}, Current User: {}, Role: {}",
                exam.getTeacherId(), currentUserId, role);

        // Admin can access any exam
        if ("ROLE_ADMIN".equals(role)) {
            log.debug("User is admin - access granted");
            return;
        }

        // Check if user is the exam creator
        if (exam.getTeacherId() == null || !exam.getTeacherId().equals(currentUserId)) {
            log.warn("User {} does not have permission for exam {}", currentUserId, exam.getId());
            throw new UnauthorizedException("You don't have permission to modify questions for this exam");
        }

        log.debug("Ownership verified - user {} owns exam {}", currentUserId, exam.getId());
    }

    /**
     * Maps Question entity to QuestionDTO
     */
    private QuestionDTO mapToDTO(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .examId(question.getExamId())
                .questionText(question.getQuestionText())
                .type(question.getType())
                .marks(question.getMarks())
                .orderIndex(question.getOrderIndex())
                .options(question.getOptions())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .difficultyLevel(question.getDifficultyLevel())
                .imageUrl(question.getImageUrl())
                .createdBy(question.getCreatedBy())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    /**
     * Maps Question entity to StudentQuestionDTO (without answers)
     */
    private StudentQuestionDTO mapToStudentDTO(Question question) {
        return StudentQuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .type(question.getType())
                .marks(question.getMarks())
                .orderIndex(question.getOrderIndex())
                .options(question.getOptions())
                .difficultyLevel(question.getDifficultyLevel())
                .imageUrl(question.getImageUrl())
                .build();
    }
}