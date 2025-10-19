package com.oerms.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service for managing blacklisted JWT tokens
 * Uses Redis for fast lookups and automatic expiration
 * 
 * @author OERMS Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String BLACKLIST_PREFIX = "blacklist:token:";

    /**
     * Add token to blacklist
     * @param token JWT token to blacklist
     * @param expirationSeconds Time until token naturally expires
     */
    public void blacklistToken(String token, long expirationSeconds) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, "blacklisted", expirationSeconds, TimeUnit.SECONDS);
        log.info("Token added to blacklist, expires in {} seconds", expirationSeconds);
    }

    /**
     * Check if token is blacklisted
     * @param token JWT token to check
     * @return true if blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    /**
     * Remove token from blacklist (rarely needed, auto-expires)
     * @param token JWT token to remove
     */
    public void removeFromBlacklist(String token) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.delete(key);
        log.info("Token removed from blacklist");
    }
}