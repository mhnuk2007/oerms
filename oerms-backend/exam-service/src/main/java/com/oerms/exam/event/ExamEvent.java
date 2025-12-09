package com.oerms.exam.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamEvent {
    private String eventType;
    private UUID examId;
    private UUID teacherId;
    private UUID studentId; // For student-specific events (exam.started, exam.completed)
    private String title;
    private String description;
    private Integer duration;
    private Integer totalMarks;
    private Integer passingMarks;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime timestamp;
    
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    public void setMetadata(String key, Object value) {
        this.metadata.put(key, value);
    }

    public Object getMetadata(String key) {
        return this.metadata.get(key);
    }
}