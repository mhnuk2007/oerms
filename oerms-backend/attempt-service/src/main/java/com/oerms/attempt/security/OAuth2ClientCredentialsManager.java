package com.oerms.attempt.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2ClientCredentialsManager {

    private final RestTemplate restTemplate;

    @Value("${oauth2.client.token-uri}")
    private String tokenUri;

    @Value("${oauth2.client.client-id}")
    private String clientId;

    @Value("${oauth2.client.client-secret}")
    private String clientSecret;

    @Value("${oauth2.client.scope:}")
    private String scope;

    private volatile String accessToken;
    private volatile Instant expiry;

    public synchronized String getToken() {
        if (isTokenInvalid()) {
            try {
                log.info("M2M token is invalid or expired. Fetching a new one for clientId: {}", clientId);
                fetchNewToken();
            } catch (HttpClientErrorException e) {
                log.error("Error fetching M2M token. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
                throw new IllegalStateException("Failed to obtain M2M token", e);
            } catch (Exception e) {
                log.error("An unexpected error occurred while fetching M2M token", e);
                throw new IllegalStateException("Failed to obtain M2M token", e);
            }
        } else {
            log.debug("Using cached M2M token.");
        }
        return accessToken;
    }

    private boolean isTokenInvalid() {
        return accessToken == null || Instant.now().isAfter(expiry);
    }

    private void fetchNewToken() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String form = "grant_type=client_credentials&client_id=" + encode(clientId)
                + "&client_secret=" + encode(clientSecret);
        if (scope != null && !scope.isBlank()) {
            form += "&scope=" + encode(scope);
        }

        HttpEntity<String> request = new HttpEntity<>(form, headers);

        log.debug("Requesting M2M token from URI: {}", tokenUri);
        Map<String, Object> resp = restTemplate.exchange(
                tokenUri,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        ).getBody();

        if (resp == null || resp.get("access_token") == null) {
            log.error("M2M token response is invalid. Response: {}", resp);
            throw new IllegalStateException("Failed to obtain client_credentials token: Invalid response from server.");
        }

        accessToken = (String) resp.get("access_token");
        Number expiresIn = (Number) resp.getOrDefault("expires_in", 3600);
        expiry = Instant.now().plusSeconds(expiresIn.longValue() - 20); // Proactive refresh
        log.info("Successfully fetched new M2M token. Expires in {} seconds.", expiresIn);
    }

    private static String encode(String v) {
        return java.net.URLEncoder.encode(v, java.nio.charset.StandardCharsets.UTF_8);
    }
}
