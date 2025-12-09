package com.oerms.gateway.filter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenValidationCacheFilter implements GlobalFilter, Ordered {

    private final ReactiveRedisTemplate<String, String> redisTemplate;
    
    private static final String TOKEN_CACHE_PREFIX = "gateway:token:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String cacheKey = TOKEN_CACHE_PREFIX + token;
            
            // Check if token validation result is cached
            return redisTemplate.opsForValue().get(cacheKey)
                    .flatMap(cachedResult -> {
                        log.debug("Token validation cache HIT");
                        // Token is valid (cached)
                        return chain.filter(exchange);
                    })
                    .switchIfEmpty(Mono.defer(() -> {
                        log.debug("Token validation cache MISS");
                        // Cache token after successful validation
                        return chain.filter(exchange)
                                .then(cacheTokenValidation(cacheKey));
                    }));
        }
        
        return chain.filter(exchange);
    }

    private Mono<Void> cacheTokenValidation(String cacheKey) {
        return redisTemplate.opsForValue()
                .set(cacheKey, "valid", CACHE_TTL)
                .doOnSuccess(result -> log.debug("Token validation cached"))
                .then();
    }

    @Override
    public int getOrder() {
        return -100; // Run early in filter chain
    }
}