package com.oerms.exam.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.UUID;


@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {

    private static final int MAX_BODY_LENGTH = 1000; // Limit body logging to avoid huge logs

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Generate unique request ID for tracking
        String requestId = UUID.randomUUID().toString().substring(0, 8);

        // Wrap request and response for logging
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);

        long startTime = System.currentTimeMillis();

        try {
            // Log incoming request
            logRequest(wrappedRequest, requestId);

            // Process the request
            chain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log response
            logResponse(wrappedRequest, wrappedResponse, duration, requestId);

            // IMPORTANT: Copy the cached response body back to the actual response
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request, String requestId) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUrl = queryString != null ? uri + "?" + queryString : uri;

        log.info("═══════════════════════════════════════════════════════════");
        log.info("📥 INCOMING REQUEST [{}]", requestId);
        log.info("   {} {}", method, fullUrl);
        log.info("   Remote: {}:{}", request.getRemoteAddr(), request.getRemotePort());
        log.info("   Content-Type: {}", request.getContentType());

        // Log authentication details
        logAuthenticationDetails(requestId);

        // Log important headers
        logHeaders(request);

        // Log request body (for POST/PUT requests)
        logRequestBody(request, requestId);
    }

    private void logAuthenticationDetails(String requestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            log.debug("   [{}] 🔓 No authentication", requestId);
            return;
        }

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            log.debug("   [{}] 🔐 Authenticated as: {}", requestId, authentication.getName());
            log.debug("   [{}] 🎫 Token type: JWT", requestId);
            
            // Log key claims
            var token = jwtAuth.getToken();
            if (token != null && token.getClaims() != null) {
                Object userId = token.getClaims().get("userId");
                Object roles = token.getClaims().get("roles");
                
                if (userId != null) {
                    log.debug("   [{}] 👤 User ID: {}", requestId, userId);
                }
                if (roles != null) {
                    log.debug("   [{}] 👔 Roles: {}", requestId, roles);
                }
            }
        } else {
            log.debug("   [{}] 🔐 Authenticated as: {} ({})", 
                requestId, authentication.getName(), authentication.getClass().getSimpleName());
        }
    }

    private void logHeaders(HttpServletRequest request) {
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null && headerNames.hasMoreElements()) {
            log.debug("   📋 Headers:");
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                
                // Don't log full Authorization header for security
                if ("Authorization".equalsIgnoreCase(headerName)) {
                    if (headerValue != null && headerValue.startsWith("Bearer ")) {
                        String token = headerValue.substring(7);
                        log.debug("      {}: Bearer ...{} (length: {})", 
                            headerName, 
                            token.length() > 10 ? token.substring(token.length() - 10) : "***",
                            token.length());
                    } else {
                        log.debug("      {}: {}", headerName, headerValue);
                    }
                } else if ("Cookie".equalsIgnoreCase(headerName)) {
                    log.debug("      {}: [REDACTED]", headerName);
                } else {
                    log.debug("      {}: {}", headerName, headerValue);
                }
            }
        }
    }

    private void logRequestBody(ContentCachingRequestWrapper request, String requestId) {
        String method = request.getMethod();
        
        // Only log body for POST, PUT, PATCH
        if (!"POST".equals(method) && !"PUT".equals(method) && !"PATCH".equals(method)) {
            return;
        }

        byte[] content = request.getContentAsByteArray();
        if (content.length > 0) {
            String body = new String(content, StandardCharsets.UTF_8);
            
            // Truncate if too long
            if (body.length() > MAX_BODY_LENGTH) {
                body = body.substring(0, MAX_BODY_LENGTH) + "... [truncated]";
            }
            
            log.debug("   [{}] 📝 Request Body:", requestId);
            log.debug("      {}", body);
        }
    }

    private void logResponse(ContentCachingRequestWrapper request, 
                            ContentCachingResponseWrapper response, 
                            long duration,
                            String requestId) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();

        String statusEmoji = getStatusEmoji(status);
        String statusCategory = getStatusCategory(status);
        
        log.info("📤 RESPONSE [{}]", requestId);
        log.info("   {} {} → {} {} {} ({}ms)", 
                method, uri, statusEmoji, status, statusCategory, duration);
        
        // Log response headers
        logResponseHeaders(response);
        
        // Log response body
        logResponseBody(response, requestId, status);
        
        // Add performance warning if slow
        if (duration > 3000) {
            log.warn("   ⚠️ SLOW REQUEST: {}ms (threshold: 3000ms)", duration);
        }
        
        log.info("═══════════════════════════════════════════════════════════");
    }

    private void logResponseHeaders(ContentCachingResponseWrapper response) {
        var headerNames = response.getHeaderNames();
        if (!headerNames.isEmpty()) {
            log.debug("   📋 Response Headers:");
            for (String headerName : headerNames) {
                String headerValue = response.getHeader(headerName);
                log.debug("      {}: {}", headerName, headerValue);
            }
        }
    }

    private void logResponseBody(ContentCachingResponseWrapper response, 
                                 String requestId, 
                                 int status) {
        byte[] content = response.getContentAsByteArray();
        
        if (content.length > 0) {
            String contentType = response.getContentType();
            
            // Only log JSON responses
            if (contentType != null && contentType.contains("application/json")) {
                String body = new String(content, StandardCharsets.UTF_8);
                
                // Truncate if too long
                if (body.length() > MAX_BODY_LENGTH) {
                    body = body.substring(0, MAX_BODY_LENGTH) + "... [truncated]";
                }
                
                // Use different log levels based on status
                if (status >= 400) {
                    log.error("   [{}] ❌ Error Response Body:", requestId);
                    log.error("      {}", body);
                } else {
                    log.debug("   [{}] ✅ Response Body:", requestId);
                    log.debug("      {}", body);
                }
            } else {
                log.debug("   [{}] Response body: {} bytes ({})", 
                    requestId, content.length, contentType);
            }
        }
    }

    private String getStatusEmoji(int status) {
        if (status >= 200 && status < 300) {
            return "✅"; // Success
        } else if (status >= 300 && status < 400) {
            return "🔄"; // Redirect
        } else if (status >= 400 && status < 500) {
            return "⚠️"; // Client error
        } else if (status >= 500) {
            return "❌"; // Server error
        }
        return "❓";
    }

    private String getStatusCategory(int status) {
        if (status >= 200 && status < 300) {
            return "SUCCESS";
        } else if (status >= 300 && status < 400) {
            return "REDIRECT";
        } else if (status == 400) {
            return "BAD_REQUEST";
        } else if (status == 401) {
            return "UNAUTHORIZED";
        } else if (status == 403) {
            return "FORBIDDEN";
        } else if (status == 404) {
            return "NOT_FOUND";
        } else if (status == 409) {
            return "CONFLICT";
        } else if (status >= 400 && status < 500) {
            return "CLIENT_ERROR";
        } else if (status == 500) {
            return "INTERNAL_ERROR";
        } else if (status == 503) {
            return "SERVICE_UNAVAILABLE";
        } else if (status >= 500) {
            return "SERVER_ERROR";
        }
        return "UNKNOWN";
    }
}