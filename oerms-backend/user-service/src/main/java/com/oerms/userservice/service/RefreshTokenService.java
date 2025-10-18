package com.oerms.userservice.service;

import com.oerms.userservice.entity.RefreshToken;
import com.oerms.userservice.entity.User;
import com.oerms.userservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    // Validity: 7 days
    private final long REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // seconds

    public RefreshToken createRefreshToken(User user) {
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_DURATION))
                .build();
        return refreshTokenRepository.save(token);
    }

    public boolean isTokenValid(RefreshToken token) {
        return token.getExpiresAt().isAfter(LocalDateTime.now());
    }

    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }
}
