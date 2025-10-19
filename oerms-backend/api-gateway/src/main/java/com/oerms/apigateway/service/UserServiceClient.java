package com.oerms.apigateway.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class UserServiceClient {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceClient.class);

    private final WebClient webClient;

    @Value("${user-service.validate-token-path:/api/auth/validate}")
    private String validateTokenPath;

    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("lb://user-service")
                .build();
    }

    public Mono<Boolean> validateToken(String token) {
        logger.debug("Validating token with User Service");

        return webClient.post()
                .uri(validateTokenPath)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(TokenValidationResponse.class)
                .map(TokenValidationResponse::isValid)
                .timeout(Duration.ofSeconds(3))
                .doOnSuccess(isValid -> logger.debug("Token validation result: {}", isValid))
                .doOnError(error -> logger.error("Token validation error: {}", error.getMessage()))
                .onErrorReturn(false); // If service is down, reject token
    }
    public static class TokenValidationResponse {
        private boolean valid;
        private String message;

        public TokenValidationResponse() {}

        public TokenValidationResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
