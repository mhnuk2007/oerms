package com.oerms.exam.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Enumeration;

/**
 * Filter to log all incoming HTTP requests and responses
 * Useful for debugging routing and service communication issues
 */
@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Wrap request and response for logging
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(httpRequest);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(httpResponse);

        long startTime = System.currentTimeMillis();

        try {
            // Log incoming request
            logRequest(wrappedRequest);

            // Process the request
            chain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log response
            logResponse(wrappedRequest, wrappedResponse, duration);

            // IMPORTANT: Copy the cached response body back to the actual response
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUrl = queryString != null ? uri + "?" + queryString : uri;

        log.info("═══════════════════════════════════════════════════════════");
        log.info("📥 INCOMING REQUEST: {} {}", method, fullUrl);
        log.info("   Remote Address: {}", request.getRemoteAddr());
        log.info("   Content-Type: {}", request.getContentType());

        // Log important headers
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            log.debug("   Headers:");
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = request.getHeader(headerName);
                
                // Don't log full Authorization header for security, just indicate it exists
                if ("Authorization".equalsIgnoreCase(headerName)) {
                    log.debug("      {}: Bearer ***", headerName);
                } else {
                    log.debug("      {}: {}", headerName, headerValue);
                }
            }
        }
    }

    private void logResponse(HttpServletRequest request, HttpServletResponse response, long duration) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();

        String statusEmoji = getStatusEmoji(status);
        
        log.info("📤 RESPONSE: {} {} → {} {} ({}ms)", 
                method, uri, statusEmoji, status, duration);
        log.info("═══════════════════════════════════════════════════════════");
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
}