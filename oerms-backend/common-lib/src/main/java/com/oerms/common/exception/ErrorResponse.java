package com.oerms.common.exception;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {
    private String error;
    private String message;
    private LocalDateTime timestamp;
    private String path;
}
