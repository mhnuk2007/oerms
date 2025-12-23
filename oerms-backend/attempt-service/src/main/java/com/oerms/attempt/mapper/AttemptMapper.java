package com.oerms.attempt.mapper;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.AttemptAnswer;
import com.oerms.attempt.entity.ExamAttempt;
import com.oerms.common.dto.AttemptDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class AttemptMapper {

    // -------------------------------
    // Internal module DTOs
    // -------------------------------

    public AttemptResponse toResponse(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptResponse.builder()
                .id(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .totalQuestions(attempt.getTotalQuestions())
                .answeredQuestions(attempt.getAnsweredQuestions())
                .flaggedQuestions(attempt.getFlaggedQuestions())
                .totalMarks(attempt.getTotalMarks())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .examDurationInMinutes(attempt.getExamDurationInMinutes())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .autoSubmitted(attempt.getAutoSubmitted())
                .notes(attempt.getNotes())
                .answers(attempt.getAnswers().stream()
                        .map(this::toAnswerResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    public AttemptAnswerResponse toAnswerResponse(AttemptAnswer answer) {
        if (answer == null) return null;

        return AttemptAnswerResponse.builder()
                .questionId(answer.getQuestionId())
                .questionOrder(answer.getQuestionOrder())
                .selectedOptions(answer.getSelectedOptions())
                .answerText(answer.getAnswerText())
                .marksAllocated(answer.getMarksAllocated())
                .timeSpentSeconds(answer.getTimeSpentSeconds())
                .flagged(answer.getFlagged())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

    public AttemptSummary toSummary(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptSummary.builder()
                .id(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .answeredQuestions(attempt.getAnsweredQuestions())
                .totalQuestions(attempt.getTotalQuestions())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    public AttemptDto toDto(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptDto.builder()
                .id(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .totalMarks(attempt.getTotalMarks())
                .totalQuestions(attempt.getTotalQuestions())
                .answeredQuestions(attempt.getAnsweredQuestions())
                .flaggedQuestions(attempt.getFlaggedQuestions())
                .examDurationInMinutes(attempt.getExamDurationInMinutes())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .autoSubmitted(attempt.getAutoSubmitted())
                .notes(attempt.getNotes())
                .answers(attempt.getAnswers().stream()
                        .map(this::toAnswerDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private AttemptAnswerDTO toAnswerDto(AttemptAnswer answer) {
        if (answer == null) return null;

        return AttemptAnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestionId())
                .questionOrder(answer.getQuestionOrder())
                .selectedOptions(answer.getSelectedOptions())
                .answerText(answer.getAnswerText())
                .marksAllocated(answer.getMarksAllocated())
                .timeSpentSeconds(answer.getTimeSpentSeconds())
                .flagged(answer.getFlagged())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

    // -------------------------------
    // Kafka / common DTOs
    // -------------------------------

    public AttemptDTO toCommonDto(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .totalMarks(attempt.getTotalMarks())
                .totalQuestions(attempt.getTotalQuestions())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .autoSubmitted(attempt.getAutoSubmitted())
                .notes(attempt.getNotes())
                .answers(attempt.getAnswers().stream()
                        .map(this::toCommonAnswerDto)
                        .collect(Collectors.toList()))
                .build();
    }

    private com.oerms.common.dto.AttemptAnswerDTO toCommonAnswerDto(AttemptAnswer answer) {
        if (answer == null) return null;

        return com.oerms.common.dto.AttemptAnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestionId())
                .questionOrder(answer.getQuestionOrder())
                .selectedOptions(answer.getSelectedOptions())
                .answerText(answer.getAnswerText())
                .marksAllocated(answer.getMarksAllocated())
                .timeSpentSeconds(answer.getTimeSpentSeconds())
                .flagged(answer.getFlagged())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

}
