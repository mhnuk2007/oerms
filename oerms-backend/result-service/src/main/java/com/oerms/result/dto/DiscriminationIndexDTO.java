package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscriminationIndexDTO {
    private UUID questionId;
    private String questionText;
    private Double discriminationIndex;
    private String interpretation; // EXCELLENT, GOOD, ACCEPTABLE, POOR
    private Integer upperGroupCorrect;
    private Integer lowerGroupCorrect;
}
