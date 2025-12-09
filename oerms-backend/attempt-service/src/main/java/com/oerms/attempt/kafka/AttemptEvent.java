package com.oerms.attempt.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UUID attemptId;             // The ID of the attempt
    private UUID examId;                // The exam ID
    private UUID studentId;             // The student ID
    private String studentName;         // Optional: student name
    private String status;              // Current attempt status (IN_PROGRESS, SUBMITTED, etc.)
    private Long timestamp;             // Epoch timestamp of event
    private Map<String, Object> additionalInfo; // Flexible map for extra event details
}
