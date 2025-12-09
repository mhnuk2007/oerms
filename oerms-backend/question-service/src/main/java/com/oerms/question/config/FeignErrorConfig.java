package com.oerms.question.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FeignErrorConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return new CustomErrorDecoder();
    }

    public static class CustomErrorDecoder implements ErrorDecoder {
        private final ErrorDecoder defaultDecoder = new Default();

        @Override
        public Exception decode(String methodKey, Response response) {
            log.error("=== Feign Error ===");
            log.error("Method: {}", methodKey);
            log.error("Status: {}", response.status());
            log.error("Reason: {}", response.reason());
            log.error("Headers: {}", response.headers());
            
            try {
                if (response.body() != null) {
                    String body = new String(response.body().asInputStream().readAllBytes(), StandardCharsets.UTF_8);
                    log.error("Response body: {}", body);
                }
            } catch (IOException e) {
                log.error("Could not read response body", e);
            }
            
            return defaultDecoder.decode(methodKey, response);
        }
    }
}