package com.oerms.exam.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oerms.common.dto.ApiResponse;
import com.oerms.common.exception.BadRequestException;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.common.exception.ServiceException;
import com.oerms.common.exception.UnauthorizedException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;


@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultDecoder = new Default();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Exception decode(String methodKey, Response response) {
        String errorMessage = extractErrorMessage(response);
        
        log.error("Feign error for {}: status={}, message={}", 
            methodKey, response.status(), errorMessage);

        return switch (response.status()) {
            case 400 -> new BadRequestException(errorMessage);
            case 401 -> new UnauthorizedException("Authentication required: " + errorMessage);
            case 403 -> new UnauthorizedException("Access denied: " + errorMessage);
            case 404 -> new ResourceNotFoundException(errorMessage);
            case 409 -> new BadRequestException("Conflict: " + errorMessage);
            case 503 -> new ServiceException("Service temporarily unavailable: " + errorMessage);
            default -> new ServiceException(
                String.format("Service error (status %d): %s", response.status(), errorMessage)
            );
        };
    }

    private String extractErrorMessage(Response response) {
        try {
            if (response.body() == null) {
                return "No error details available";
            }

            InputStream bodyStream = response.body().asInputStream();
            
            // Try to parse as ApiResponse
            try {
                ApiResponse<?> apiResponse = objectMapper.readValue(bodyStream, ApiResponse.class);
                if (apiResponse.getMessage() != null && !apiResponse.getMessage().isBlank()) {
                    return apiResponse.getMessage();
                }
            } catch (Exception e) {
                log.debug("Could not parse response as ApiResponse, using raw body");
            }

            // Fall back to reading raw body
            bodyStream.reset();
            String rawBody = new String(bodyStream.readAllBytes());
            
            if (rawBody != null && !rawBody.isBlank()) {
                return rawBody.length() > 200 
                    ? rawBody.substring(0, 200) + "..." 
                    : rawBody;
            }

        } catch (IOException e) {
            log.error("Failed to read error response body", e);
        }

        return "Error communicating with service";
    }
}