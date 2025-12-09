package com.oerms.result.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGradeRequest {
    @NotNull(message = "Obtained marks is required")
    @Min(value = 0, message = "Marks cannot be negative")
    private Double obtainedMarks;

    private String teacherFeedback;
}
