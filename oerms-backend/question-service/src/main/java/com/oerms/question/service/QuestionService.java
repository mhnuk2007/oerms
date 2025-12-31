package com.oerms.question.service;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ServiceException;
import com.oerms.common.exception.UnauthorizedException;
import com.oerms.common.util.JwtUtils;
import com.oerms.question.client.ExamServiceClient;
import com.oerms.question.dto.*;
import com.oerms.question.entity.DifficultyLevel;
import com.oerms.question.entity.Question;
import com.oerms.question.entity.QuestionType;
import com.oerms.question.mapper.QuestionMapper;
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
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ExamServiceClient examServiceClient;
    private final QuestionMapper questionMapper;

    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, key = "#request.examId")
    public QuestionDTO createQuestion(CreateQuestionRequest request, Authentication authentication) {
        log.info("Attempting to create a question for examId: {}", request.getExamId());
        ExamDTO exam = getExamOrThrow(request.getExamId());
        verifyExamOwnership(exam, authentication);
        validateQuestion(request);

        Integer maxOrderIndex = questionRepository.findMaxOrderIndexByExamId(request.getExamId());
        int orderIndex = (request.getOrderIndex() != null) ? request.getOrderIndex() : (maxOrderIndex != null ? maxOrderIndex + 1 : 1);

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

        question = questionRepository.save(question);
        log.info("Successfully created question with id: {} for examId: {}", question.getId(), request.getExamId());
        return mapToDTO(question);
    }

    @Cacheable(value = "examQuestions", key = "#examId")
    public List<QuestionDTO> getExamQuestions(UUID examId) {
        log.info("Fetching all questions for examId: {}", examId);
        List<Question> questions = questionRepository.findByExamIdOrderByOrderIndexAsc(examId);
        log.info("Found {} questions for examId: {}", questions.size(), examId);
        return questions.stream().map(this::mapToDTO).toList();
    }

    @Cacheable(value = "examQuestionsStudent", key = "#examId + '-' + #shuffle")
    public List<StudentQuestionDTO> getExamQuestionsForStudent(UUID examId, boolean shuffle) {
        log.info("Fetching questions for student for examId: {}. Shuffle enabled: {}", examId, shuffle);
        List<Question> questions = questionRepository.findByExamIdOrderByOrderIndexAsc(examId);
        List<StudentQuestionDTO> studentQuestions = questions.stream()
                .map(this::mapToStudentDTO)
                .collect(Collectors.toCollection(ArrayList::new));

        if (shuffle) {
            Collections.shuffle(studentQuestions);
            log.info("Shuffled {} questions for examId: {}", studentQuestions.size(), examId);
        }
        log.info("Returning {} questions for student for examId: {}", studentQuestions.size(), examId);
        return studentQuestions;
    }

    public QuestionDTO getQuestion(UUID questionId) {
        log.info("Fetching question with id: {}", questionId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> {
                    log.error("Question not found with id: {}", questionId);
                    return new ResourceNotFoundException("Question not found with id: " + questionId);
                });
        return mapToDTO(question);
    }

    public List<QuestionDTO> getQuestionsByIds(List<UUID> questionIds) {
        log.info("Fetching a batch of {} questions by IDs.", questionIds.size());
        if (questionIds.isEmpty()) {
            log.warn("Received request to fetch questions with an empty ID list.");
            return Collections.emptyList();
        }
        List<Question> questions = questionRepository.findAllById(questionIds);
        log.info("Found {} questions out of {} requested.", questions.size(), questionIds.size());
        if (questions.size() != questionIds.size()) {
            List<UUID> foundIds = questions.stream().map(Question::getId).toList();
            List<UUID> missingIds = new ArrayList<>(questionIds);
            missingIds.removeAll(foundIds);
            log.warn("Could not find the following question IDs: {}", missingIds);
        }
        return questions.stream().map(this::mapToDTO).toList();
    }

    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, allEntries = true)
    public QuestionDTO updateQuestion(UUID questionId, UpdateQuestionRequest request, Authentication authentication) {
        log.info("Attempting to update questionId: {}", questionId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        ExamDTO exam = getExamOrThrow(question.getExamId());
        verifyExamOwnership(exam, authentication);

        if (request.getQuestionText() != null) question.setQuestionText(request.getQuestionText());
        if (request.getType() != null) question.setType(request.getType());
        if (request.getMarks() != null) question.setMarks(request.getMarks());
        if (request.getOrderIndex() != null) question.setOrderIndex(request.getOrderIndex());
        if (request.getOptions() != null) question.setOptions(request.getOptions());
        if (request.getCorrectAnswer() != null) question.setCorrectAnswer(request.getCorrectAnswer());
        if (request.getExplanation() != null) question.setExplanation(request.getExplanation());
        if (request.getDifficultyLevel() != null) question.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getImageUrl() != null) question.setImageUrl(request.getImageUrl());

        validateQuestionUpdate(question);
        question = questionRepository.save(question);
        log.info("Successfully updated questionId: {}", questionId);
        return mapToDTO(question);
    }

    @Transactional
    public List<QuestionDTO> duplicateExamQuestions(UUID sourceExamId, UUID targetExamId, Authentication authentication) {
        log.info("Duplicating questions from exam {} to exam {}", sourceExamId, targetExamId);

        // Get all questions from source exam
        List<Question> sourceQuestions = questionRepository.findByExamIdOrderByOrderIndexAsc(sourceExamId);

        if (sourceQuestions.isEmpty()) {
            log.warn("No questions found in source exam {}", sourceExamId);
            return Collections.emptyList();
        }

        // Get user info for audit
        UUID userId = JwtUtils.getUserId(authentication);
        String username = JwtUtils.getUsername(authentication);

        // Create duplicated questions
        List<Question> duplicatedQuestions = new ArrayList<>();

        for (Question sourceQuestion : sourceQuestions) {
            Question newQuestion = new Question();

            // Copy all fields
            newQuestion.setExamId(targetExamId);
            newQuestion.setQuestionText(sourceQuestion.getQuestionText());
            newQuestion.setType(sourceQuestion.getType());
            newQuestion.setMarks(sourceQuestion.getMarks());
            newQuestion.setOrderIndex(sourceQuestion.getOrderIndex());
            newQuestion.setOptions(sourceQuestion.getOptions());
            newQuestion.setCorrectAnswer(sourceQuestion.getCorrectAnswer());
            newQuestion.setExplanation(sourceQuestion.getExplanation());
            newQuestion.setDifficultyLevel(sourceQuestion.getDifficultyLevel());
            newQuestion.setExplanation(sourceQuestion.getExplanation());
            newQuestion.setImageUrl(sourceQuestion.getImageUrl());

            duplicatedQuestions.add(newQuestion);
        }

        // Save all duplicated questions
        List<Question> savedQuestions = questionRepository.saveAll(duplicatedQuestions);

        log.info("Successfully duplicated {} questions from exam {} to exam {}",
                savedQuestions.size(), sourceExamId, targetExamId);

        return savedQuestions.stream()
                .map(questionMapper::toQuestionDTO)
                .collect(Collectors.toList());
    }


    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, allEntries = true)
    public void deleteQuestion(UUID questionId, Authentication authentication) {
        log.info("Attempting to delete questionId: {}", questionId);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        ExamDTO exam = getExamOrThrow(question.getExamId());
        verifyExamOwnership(exam, authentication);
        questionRepository.delete(question);
        log.info("Successfully deleted questionId: {}", questionId);
    }

    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, allEntries = true)
    public List<QuestionDTO> bulkCreateQuestions(BulkCreateQuestionsRequest request, Authentication authentication) {
        log.info("Starting bulk creation of {} questions", request.getQuestions().size());
        List<QuestionDTO> createdQuestions = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < request.getQuestions().size(); i++) {
            CreateQuestionRequest questionRequest = request.getQuestions().get(i);
            try {
                createdQuestions.add(createQuestion(questionRequest, authentication));
            } catch (Exception e) {
                String error = String.format("Failed to create question %d for exam %s: %s", i + 1, questionRequest.getExamId(), e.getMessage());
                errors.add(error);
                log.error(error, e);
            }
        }
        log.info("Bulk creation completed: {} successful, {} failed", createdQuestions.size(), errors.size());
        if (!errors.isEmpty() && createdQuestions.isEmpty()) {
            throw new BadRequestException("All questions failed to create: " + String.join("; ", errors));
        }
        return createdQuestions;
    }

    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent", "questionStatistics"}, key = "#examId")
    public void deleteAllExamQuestions(UUID examId, Authentication authentication) {
        log.info("Attempting to delete all questions for examId: {}", examId);
        ExamDTO exam = getExamOrThrow(examId);
        verifyExamOwnership(exam, authentication);
        long count = questionRepository.countByExamId(examId);
        questionRepository.deleteByExamId(examId);
        log.info("Successfully deleted {} questions for examId: {}", count, examId);
    }

    public Long getQuestionCount(UUID examId) {
        log.debug("Fetching question count for examId: {}", examId);
        return questionRepository.countByExamId(examId);
    }

    public Integer getTotalMarks(UUID examId) {
        log.debug("Fetching total marks for examId: {}", examId);
        Integer total = questionRepository.sumMarksByExamId(examId);
        return (total != null) ? total : 0;
    }

    @Cacheable(value = "questionStatistics", key = "#examId")
    public QuestionStatisticsDTO getExamStatistics(UUID examId) {
        log.info("Calculating statistics for examId: {}", examId);
        Long totalQuestions = getQuestionCount(examId);
        Integer totalMarks = getTotalMarks(examId);
        return QuestionStatisticsDTO.builder()
                .examId(examId)
                .totalQuestions(totalQuestions)
                .totalMarks(totalMarks)
                .mcqCount(questionRepository.countByExamIdAndType(examId, QuestionType.MCQ))
                .trueFalseCount(questionRepository.countByExamIdAndType(examId, QuestionType.TRUE_FALSE))
                .shortAnswerCount(questionRepository.countByExamIdAndType(examId, QuestionType.SHORT_ANSWER))
                .essayCount(questionRepository.countByExamIdAndType(examId, QuestionType.ESSAY))
                .easyCount(questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.EASY))
                .mediumCount(questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.MEDIUM))
                .hardCount(questionRepository.countByExamIdAndDifficultyLevel(examId, DifficultyLevel.HARD))
                .build();
    }

    @Transactional
    @CacheEvict(value = {"examQuestions", "examQuestionsStudent"}, key = "#examId")
    public List<QuestionDTO> reorderQuestions(UUID examId, List<UUID> questionIds, Authentication authentication) {
        log.info("Reordering {} questions for examId: {}", questionIds.size(), examId);
        ExamDTO exam = getExamOrThrow(examId);
        verifyExamOwnership(exam, authentication);
        List<QuestionDTO> reordered = new ArrayList<>();
        for (int i = 0; i < questionIds.size(); i++) {
            UUID questionId = questionIds.get(i);
            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + questionId));
            if (!question.getExamId().equals(examId)) {
                throw new BadRequestException("Question " + questionId + " does not belong to exam " + examId);
            }
            question.setOrderIndex(i + 1);
            question = questionRepository.save(question);
            reordered.add(mapToDTO(question));
        }
        log.info("Successfully reordered {} questions for examId: {}", questionIds.size(), examId);
        return reordered;
    }

    private void validateQuestion(CreateQuestionRequest request) {
        if (request.getType() == QuestionType.MCQ || request.getType() == QuestionType.MULTIPLE_ANSWER) {
            if (request.getOptions() == null || request.getOptions().size() < 2) {
                throw new BadRequestException("MCQ/Multiple Answer questions must have at least 2 options.");
            }
            if (request.getCorrectAnswer() == null || request.getCorrectAnswer().isBlank()) {
                throw new BadRequestException("MCQ/Multiple Answer questions must have a correct answer.");
            }
        }
        if (request.getType() == QuestionType.TRUE_FALSE) {
            if (request.getCorrectAnswer() == null || !List.of("TRUE", "FALSE").contains(request.getCorrectAnswer().toUpperCase())) {
                throw new BadRequestException("True/False question answer must be TRUE or FALSE.");
            }
        }
        if (request.getMarks() <= 0) {
            throw new BadRequestException("Question marks must be greater than 0.");
        }
    }

    private void validateQuestionUpdate(Question question) {
        if (question.getType() == QuestionType.MCQ || question.getType() == QuestionType.MULTIPLE_ANSWER) {
            if (question.getOptions() == null || question.getOptions().size() < 2) {
                throw new BadRequestException("MCQ/Multiple Answer questions must have at least 2 options.");
            }
        }
        if (question.getType() == QuestionType.TRUE_FALSE && question.getCorrectAnswer() != null) {
            if (!List.of("TRUE", "FALSE").contains(question.getCorrectAnswer().toUpperCase())) {
                throw new BadRequestException("True/False question answer must be TRUE or FALSE.");
            }
        }
    }

    private ExamDTO getExamOrThrow(UUID examId) {
        try {
            log.debug("Fetching exam details from exam-service for examId: {}", examId);
            ApiResponse<ExamDTO> response = examServiceClient.getExam(examId);
            if (response != null && response.isSuccess() && response.getData() != null) {
                log.debug("Successfully fetched exam details for examId: {}", examId);
                return response.getData();
            }
            log.error("Invalid or unsuccessful response from exam-service for examId: {}. Response: {}", examId, response);
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        } catch (FeignException e) {
            log.error("Feign client error while fetching exam {}: Status {}, Body {}", examId, e.status(), e.contentUTF8(), e);
            throw new ServiceException("Failed to fetch exam details due to a service communication error.");
        }
    }

    private void verifyExamOwnership(ExamDTO exam, Authentication authentication) {
        UUID currentUserId = JwtUtils.getUserId(authentication);
        String role = JwtUtils.getRole(authentication);

        if ("ROLE_ADMIN".equals(role)) {
            log.debug("Admin user {} granted access to exam {}", currentUserId, exam.getId());
            return;
        }
        if (exam.getTeacherId() == null || !exam.getTeacherId().equals(currentUserId)) {
            log.warn("Unauthorized access attempt on exam {} by user {}. Exam is owned by {}.", exam.getId(), currentUserId, exam.getTeacherId());
            throw new UnauthorizedException("You do not have permission to modify questions for this exam.");
        }
    }
    
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
                .createdBy(null) // Since createdBy is not in the entity
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }

    private StudentQuestionDTO mapToStudentDTO(Question question) {
        return StudentQuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .type(question.getType())
                .marks(Optional.ofNullable(question.getMarks()).orElse(0)) // Handle null marks
                .orderIndex(question.getOrderIndex())
                .options(question.getOptions())
                .difficultyLevel(question.getDifficultyLevel())
                .imageUrl(question.getImageUrl())
                .build();
    }
}
