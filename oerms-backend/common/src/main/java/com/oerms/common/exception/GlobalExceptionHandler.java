package com.oerms.common.exception;

import com.oerms.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<String>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String error = String.format("The parameter '%s' with value '%s' is invalid. A valid UUID is required.", ex.getName(), ex.getValue());
        return new ResponseEntity<>(ApiResponse.error(error, null), HttpStatus.BAD_REQUEST);
    }
}