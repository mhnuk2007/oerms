package com.oerms.attempt.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveProgressRequest {
    private UUID currentQuestionId;
    private Integer currentQuestionIndex;
}
