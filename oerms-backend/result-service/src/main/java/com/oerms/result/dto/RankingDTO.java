package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingDTO {
    private Integer rank;
    private UUID studentId;
    private String studentName;
    private Double obtainedMarks;
    private Double percentage;
    private String grade;
    private Integer timeTakenSeconds;
}
