package com.oerms.result.mapper;


import com.oerms.common.dto.AttemptDTO;
import com.oerms.common.event.AttemptEvent;

public final class AttemptEventMapper {

    private AttemptEventMapper() {}

    public static AttemptDTO toAttemptDto(AttemptEvent e) {
        AttemptDTO a = e.getAttemptDTO(); // get the nested DTO
        return AttemptDTO.builder()
                .id(a.getId())
                .examId(a.getExamId())
                .examTitle(a.getExamTitle())
                .studentId(a.getStudentId())
                .studentName(a.getStudentName())
                .attemptNumber(a.getAttemptNumber())
                .status(a.getStatus())
                .startedAt(a.getStartedAt())
                .submittedAt(a.getSubmittedAt())
                .timeTakenSeconds(a.getTimeTakenSeconds())
                .autoSubmitted(a.getAutoSubmitted())
                .totalMarks(a.getTotalMarks())
                .obtainedMarks(a.getObtainedMarks())
                .percentage(a.getPercentage())
                .passed(a.getPassed())
                .totalQuestions(a.getTotalQuestions())
                .tabSwitches(a.getTabSwitches())
                .webcamViolations(a.getWebcamViolations())
                .notes(a.getNotes())
                .answers(a.getAnswers())
                .build();
    }
}

