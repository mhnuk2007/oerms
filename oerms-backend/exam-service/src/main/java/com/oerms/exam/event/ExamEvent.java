package com.oerms.exam.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamEvent {
private String eventType; // exam.created, exam.published, exam.completed
private Long examId;
private Long teacherId;
private String title;
private String description;
private Integer duration;
private Integer totalMarks;
private Integer passingMarks;
private LocalDateTime startTime;
private LocalDateTime endTime;
private String status;
private LocalDateTime timestamp;
}