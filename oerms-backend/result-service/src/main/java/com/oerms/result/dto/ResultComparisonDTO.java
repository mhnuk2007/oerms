package com.oerms.result.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultComparisonDTO {
    private UUID studentId;
    private String studentName;
    private Double studentScore;
    private Double classAverage;
    private Double highestScore;
    private Double lowestScore;
    private Integer studentRank;
    private Integer totalStudents;
    private String performance;
}
