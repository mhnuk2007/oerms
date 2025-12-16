package com.oerms.attempt.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class SaveAnswerRequest {
    @NotNull
    private UUID questionId;
    private Set<String> selectedOptions;
    private String answerText;
    private Boolean flagged;
    private Integer timeSpentSeconds;
}
