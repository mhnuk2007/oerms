package com.oerms.exam.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResultDTO {
    private Boolean isValid;
    private Integer errorCount;
    private List<ValidationError> errors;
    private LocalDateTime validatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationError {
        private String field;
        private String message;
    }
}
