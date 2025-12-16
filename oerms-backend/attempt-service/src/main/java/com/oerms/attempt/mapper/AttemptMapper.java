package com.oerms.attempt.mapper;

import com.oerms.attempt.dto.*;
import com.oerms.attempt.entity.AttemptAnswer;
import com.oerms.attempt.entity.ExamAttempt;
import com.oerms.common.dto.AttemptDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class AttemptMapper {

    // ==================================================
    // INTERNAL DTO (Service-level)
    // ==================================================
    public AttemptDto toDTO(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptDto.builder()
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
                .passed(attempt.getPassed())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .remainingTimeSeconds(attempt.getRemainingTimeSeconds())
                .examDurationInMinutes(attempt.getExamDurationInMinutes())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .copyPasteCount(attempt.getCopyPasteCount())
                .autoSubmitted(attempt.getAutoSubmitted())
                .reviewed(attempt.getReviewed())
                .notes(attempt.getNotes())
                .answers(
                        attempt.getAnswers()
                                .stream()
                                .map(this::toAnswerDTO)
                                .collect(Collectors.toList())
                )
                .build();
    }

    // ==================================================
    // INTERNAL ANSWER DTO
    // ==================================================
    public AttemptAnswerDTO toAnswerDTO(AttemptAnswer answer) {
        if (answer == null) return null;

        return AttemptAnswerDTO.builder()
                .id(answer.getId())
                .questionId(answer.getQuestionId())
                .questionOrder(answer.getQuestionOrder())
                .selectedOptions(answer.getSelectedOptions())
                .answerText(answer.getAnswerText())
                .correct(answer.getIsCorrect())
                .marksAllocated(answer.getMarksAllocated())
                .marksObtained(answer.getMarksObtained())
                .timeSpentSeconds(answer.getTimeSpentSeconds())
                .flagged(answer.getFlagged())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

    // ==================================================
    // API RESPONSE (Controller output)
    // ==================================================
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
                .obtainedMarks(attempt.getObtainedMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .remainingTimeSeconds(attempt.getRemainingTimeSeconds())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .autoSubmitted(attempt.getAutoSubmitted())
                .reviewed(attempt.getReviewed())
                .notes(attempt.getNotes())
                .answers(
                        attempt.getAnswers()
                                .stream()
                                .map(this::toAnswerResponse)
                                .collect(Collectors.toList())
                )
                .build();
    }

    // ==================================================
    // ANSWER RESPONSE (API)
    // ==================================================
    public AttemptAnswerResponse toAnswerResponse(AttemptAnswer answer) {
        if (answer == null) return null;

        return AttemptAnswerResponse.builder()
                .questionId(answer.getQuestionId())
                .questionOrder(answer.getQuestionOrder())
                .selectedOptions(answer.getSelectedOptions())
                .answerText(answer.getAnswerText())
                .correct(answer.getIsCorrect())
                .marksAllocated(answer.getMarksAllocated())
                .marksObtained(answer.getMarksObtained())
                .timeSpentSeconds(answer.getTimeSpentSeconds())
                .flagged(answer.getFlagged())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

    // ==================================================
    // SUMMARY (Dashboard / List)
    // ==================================================
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
                .obtainedMarks(attempt.getObtainedMarks())
                .percentage(attempt.getPercentage())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .build();
    }

    // ==================================================
    // COMMON DTO (Kafka / cross-service)
    // ==================================================
    public static AttemptDTO toCommonDto(ExamAttempt attempt) {
        if (attempt == null) return null;

        return AttemptDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentId(attempt.getStudentId())
                .studentName(attempt.getStudentName())
                .attemptNumber(attempt.getAttemptNumber())
                .status(attempt.getStatus() == null ? null : com.oerms.common.enums.AttemptStatus.valueOf(attempt.getStatus().name()))
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .totalMarks(attempt.getTotalMarks())
                .obtainedMarks(attempt.getObtainedMarks())
                .percentage(attempt.getPercentage())
                .passed(attempt.getPassed())
                .totalQuestions(attempt.getTotalQuestions())
                .tabSwitches(attempt.getTabSwitches())
                .webcamViolations(attempt.getWebcamViolations())
                .autoSubmitted(attempt.getAutoSubmitted())
                .answers(
                        attempt.getAnswers() == null ? null :
                                attempt.getAnswers().stream()
                                        .map(answer -> com.oerms.common.dto.AttemptAnswerDTO.builder()
                                                .id(answer.getId())
                                                .questionId(answer.getQuestionId())
                                                .questionOrder(answer.getQuestionOrder())
                                                .selectedOptions(answer.getSelectedOptions())
                                                .answerText(answer.getAnswerText())
                                                .correct(answer.getIsCorrect())
                                                .marksAllocated(answer.getMarksAllocated())
                                                .marksObtained(answer.getMarksObtained())
                                                .timeSpentSeconds(answer.getTimeSpentSeconds())
                                                .flagged(answer.getFlagged())
                                                .answeredAt(answer.getAnsweredAt())
                                                .build()
                                        )
                                        .toList()
                )
                .notes(attempt.getNotes())
                .build();
    }


}
