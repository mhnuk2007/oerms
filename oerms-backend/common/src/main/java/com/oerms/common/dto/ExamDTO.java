package com.oerms.common.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
    private UUID id;
    private String title;
    private String description;
    private String subject;
    private UUID teacherId;
    private String teacherName;
    private Integer duration;
    private Integer totalMarks;
    private Integer passingMarks;
    private String instructions;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Boolean isActive;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Boolean showResultsImmediately;
    private Boolean allowReview;
    private Integer maxAttempts;
    private List<UUID> prerequisiteExamIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
