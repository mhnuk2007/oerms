package com.oerms.result.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResultRequest {
    @NotNull(message = "Result ID is required")
    private UUID resultId;

    @NotNull(message = "Obtained marks is required")
    @Min(value = 0, message = "Marks cannot be negative")
    private Double obtainedMarks;

    private String teacherFeedback;
    private String teacherRemarks;
}
