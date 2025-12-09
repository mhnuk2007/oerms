package com.oerms.attempt.mapper;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.*;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class AttemptMapper {

    public AttemptResponse toResponse(ExamAttempt attempt) {
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
            .obtainedMarks(attempt.getObtainedMarks())
            .percentage(attempt.getPercentage())
            .startedAt(attempt.getStartedAt())
            .submittedAt(attempt.getSubmittedAt())
            .timeTakenSeconds(attempt.getTimeTakenSeconds())
            .tabSwitches(attempt.getTabSwitches())
            .webcamViolations(attempt.getWebcamViolations())
            .autoSubmitted(attempt.getAutoSubmitted())
            .reviewed(attempt.getReviewed())
            .passed(attempt.getPassed())
            .notes(attempt.getNotes())
            .answers(attempt.getAnswers().stream()
                .map(this::toAnswerResponse)
                .collect(Collectors.toList()))
            .createdAt(attempt.getCreatedAt())
            .build();
    }

    public AttemptSummary toSummary(ExamAttempt attempt) {
        return AttemptSummary.builder()
            .id(attempt.getId())
            .examId(attempt.getExamId())
            .examTitle(attempt.getExamTitle())
            .attemptNumber(attempt.getAttemptNumber())
            .status(attempt.getStatus())
            .answeredQuestions(attempt.getAnsweredQuestions())
            .totalQuestions(attempt.getTotalQuestions())
            .obtainedMarks(attempt.getObtainedMarks())
            .percentage(attempt.getPercentage())
            .startedAt(attempt.getStartedAt())
            .submittedAt(attempt.getSubmittedAt())
            .build();
    }

    public AttemptAnswerResponse toAnswerResponse(AttemptAnswer answer) {
        return AttemptAnswerResponse.builder()
            .id(answer.getId())
            .questionId(answer.getQuestionId())
            .questionOrder(answer.getQuestionOrder())
            .selectedOptions(answer.getSelectedOptions())
            .answerText(answer.getAnswerText())
            .isCorrect(answer.getIsCorrect())
            .marksObtained(answer.getMarksObtained())
            .marksAllocated(answer.getMarksAllocated())
            .timeSpentSeconds(answer.getTimeSpentSeconds())
            .flagged(answer.getFlagged())
            .answeredAt(answer.getAnsweredAt())
            .build();
    }
}