package com.oerms.exam.config;

import feign.Logger;
import feign.Request;
import feign.Response;
import feign.Util;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;

/**
 * Custom Feign logger that provides detailed logging of inter-service communication
 * Shows request/response details with proper formatting
 */
@Slf4j
public class CustomFeignLogger extends Logger {

    private static final int MAX_BODY_LENGTH = 1000;

    @Override
    protected void log(String configKey, String format, Object... args) {
        log.debug(String.format(methodTag(configKey) + format, args));
    }

    @Override
    protected void logRequest(String configKey, Level logLevel, Request request) {
        if (logLevel.ordinal() >= Level.HEADERS.ordinal()) {
            log.info("┌─────────────────────────────────────────────────────────");
            log.info("│ 🔗 FEIGN REQUEST");
            log.info("├─────────────────────────────────────────────────────────");
            log.info("│ Target: {}", request.url());
            log.info("│ Method: {}", request.httpMethod());
            
            if (logLevel.ordinal() >= Level.HEADERS.ordinal()) {
                logHeaders(request.headers(), "Request");
            }
            
            if (logLevel.ordinal() >= Level.FULL.ordinal() && request.body() != null) {
                logBody("Request", request.body());
            }
        }
    }

    @Override
    protected Response logAndRebufferResponse(String configKey, Level logLevel, Response response, 
                                             long elapsedTime) throws IOException {
        if (logLevel.ordinal() >= Level.HEADERS.ordinal()) {
            int status = response.status();
            String statusEmoji = getStatusEmoji(status);
            
            log.info("├─────────────────────────────────────────────────────────");
            log.info("│ 📥 FEIGN RESPONSE");
            log.info("├─────────────────────────────────────────────────────────");
            log.info("│ Status: {} {} ({}ms)", statusEmoji, status, elapsedTime);
            log.info("│ Reason: {}", response.reason());
            
            if (logLevel.ordinal() >= Level.HEADERS.ordinal()) {
                logHeaders(response.headers(), "Response");
            }
            
            if (logLevel.ordinal() >= Level.FULL.ordinal() && response.body() != null) {
                byte[] bodyData = Util.toByteArray(response.body().asInputStream());
                
                if (bodyData.length > 0) {
                    logBody("Response", bodyData);
                }
                
                log.info("└─────────────────────────────────────────────────────────");
                
                // Return response with rebuffered body
                return response.toBuilder().body(bodyData).build();
            }
            
            log.info("└─────────────────────────────────────────────────────────");
        }
        
        return response;
    }

    @Override
    protected IOException logIOException(String configKey, Level logLevel, IOException ioe, 
                                        long elapsedTime) {
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ ❌ FEIGN ERROR ({}ms)", elapsedTime);
        log.error("├─────────────────────────────────────────────────────────");
        log.error("│ Error: {}", ioe.getMessage());
        log.error("│ Type: {}", ioe.getClass().getName());
        log.error("└─────────────────────────────────────────────────────────");
        return ioe;
    }

    private void logHeaders(Map<String, Collection<String>> headers, String type) {
        log.info("│ {} Headers:", type);
        
        headers.forEach((name, values) -> {
            values.forEach(value -> {
                // Mask sensitive headers
                if ("authorization".equalsIgnoreCase(name) && value.startsWith("Bearer ")) {
                    String token = value.substring(7);
                    log.info("│   {}: Bearer ...{} ({}chars)", 
                        name, 
                        token.length() > 10 ? token.substring(token.length() - 10) : "***",
                        token.length());
                } else {
                    log.info("│   {}: {}", name, value);
                }
            });
        });
    }

    private void logBody(String type, byte[] body) {
        String bodyText = new String(body, StandardCharsets.UTF_8);
        
        log.info("│ {} Body:", type);
        
        // Truncate if too long
        if (bodyText.length() > MAX_BODY_LENGTH) {
            bodyText = bodyText.substring(0, MAX_BODY_LENGTH) + "... [truncated]";
        }
        
        // Pretty print if JSON
        if (bodyText.trim().startsWith("{") || bodyText.trim().startsWith("[")) {
            // Split by lines for better readability
            String[] lines = bodyText.split("\n");
            for (String line : lines) {
                log.info("│   {}", line.trim());
            }
        } else {
            log.info("│   {}", bodyText);
        }
    }

    private String getStatusEmoji(int status) {
        if (status >= 200 && status < 300) {
            return "✅";
        } else if (status >= 400 && status < 500) {
            return "⚠️";
        } else if (status >= 500) {
            return "❌";
        }
        return "❓";
    }
}