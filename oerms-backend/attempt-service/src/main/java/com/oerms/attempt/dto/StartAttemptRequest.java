package com.oerms.attempt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAttemptRequest {
    @NotNull
    private UUID examId;
    private String examTitle;
    private Integer duration;
    private UUID studentId;
    private String studentName;
    private String ipAddress;
    private String userAgent;
    private List<QuestionInfo> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionInfo {
        private UUID questionId;
        private Integer marks;
    }
}
