package com.oerms.exam.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import feign.RequestInterceptor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value; // ← CORRECT IMPORT
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Configuration
@Slf4j
public class FeignM2MConfig {

    @Value("${auth.token-uri}")  // Now using Spring's @Value
    private String tokenUri;

    @Value("${auth.client-id}")
    private String clientId;

    @Value("${auth.client-secret}")
    private String clientSecret;

    private M2MToken m2mToken;

    @Bean
    public RequestInterceptor m2mRequestInterceptor() {
        return requestTemplate -> {
            if (m2mToken == null || m2mToken.isExpired()) {
                log.info("M2M token is expired or null. Fetching new token.");
                m2mToken = fetchM2MToken();
            }
            if (m2mToken != null) {
                requestTemplate.header("Authorization", "Bearer " + m2mToken.getAccessToken());
                log.debug("Added M2M token to request for: {}", requestTemplate.feignTarget().name());
            } else {
                log.error("Failed to add M2M token to request, as the token is null.");
            }
        };
    }

    private M2MToken fetchM2MToken() {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("grant_type", "client_credentials");
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("scope", "internal");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(map, headers);

        try {
            log.debug("Fetching M2M token from: {}", tokenUri);
            TokenResponse response = restTemplate.postForObject(tokenUri, entity, TokenResponse.class);
            if (response != null && response.getAccessToken() != null) {
                log.info("Successfully fetched new M2M token. Expires in: {} seconds", response.getExpiresIn());
                return new M2MToken(response.getAccessToken(), response.getExpiresIn());
            } else {
                log.error("M2M token response was null or missing access token");
            }
        } catch (Exception e) {
            log.error("Failed to fetch M2M token from {}: {}", tokenUri, e.getMessage(), e);
        }
        return null;
    }

    @Data
    private static class TokenResponse {
        @JsonProperty("access_token")
        private String accessToken;
        @JsonProperty("expires_in")
        private long expiresIn;
    }

    @Data
    private static class M2MToken {
        private String accessToken;
        private Instant expiryTime;

        public M2MToken(String accessToken, long expiresIn) {
            this.accessToken = accessToken;
            // Add a 60-second buffer to prevent using an expiring token
            this.expiryTime = Instant.now().plusSeconds(expiresIn - 60);
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiryTime);
        }
    }
}