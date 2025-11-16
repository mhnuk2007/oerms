package com.oerms.exam.dto;

import com.oerms.exam.entity.ExamStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDTO {
private Long id;
private String title;
private String description;
private Long teacherId;
private String teacherName;
private Integer duration;
private Integer totalMarks;
private Integer passingMarks;
private LocalDateTime startTime;
private LocalDateTime endTime;
private ExamStatus status;
private Boolean isActive;
private Boolean allowMultipleAttempts;
private Integer maxAttempts;
private Boolean shuffleQuestions;
private Boolean showResultsImmediately;
private String instructions;
private LocalDateTime createdAt;
private LocalDateTime updatedAt;
}