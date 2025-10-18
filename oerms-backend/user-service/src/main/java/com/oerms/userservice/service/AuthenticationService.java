package com.oerms.userservice.service;

import com.oerms.userservice.dto.AuthResponse;
import com.oerms.userservice.dto.LoginRequest;
import com.oerms.userservice.dto.RefreshTokenRequest;
import com.oerms.userservice.entity.RefreshToken;
import com.oerms.userservice.entity.User;
import com.oerms.userservice.exception.UnauthorizedException;
import com.oerms.userservice.mapper.UserMapper;
import com.oerms.userservice.repository.RefreshTokenRepository;
import com.oerms.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    
    @Value("${jwt.expiration:86400000}")
    private Long jwtExpiration;
    
    @Value("${jwt.refresh-expiration:604800000}")
    private Long refreshExpiration;
    
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        
        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is inactive");
        }
        
        if (user.getIsDeleted()) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        
        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate tokens
        String accessToken = jwtService.generateToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user);
        
        // Save refresh token
        saveRefreshToken(user, refreshTokenStr);
        
        log.info("User logged in successfully: {}", user.getEmail());
        
        return AuthResponse.builder()
            .token(accessToken)
            .refreshToken(refreshTokenStr)
            .user(userMapper.toDto(user))
            .expiresIn(jwtExpiration / 1000) // Convert to seconds
            .build();
    }
    
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenStr = request.getRefreshToken();
        
        if (!jwtService.validateToken(refreshTokenStr)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        
        UUID userId = jwtService.getUserIdFromToken(refreshTokenStr);
        
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
            .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));
        
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired");
        }
        
        User user = refreshToken.getUser();
        
        if (!user.getIsActive() || user.getIsDeleted()) {
            throw new UnauthorizedException("Account is inactive");
        }
        
        // Generate new tokens
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        
        // Update refresh token
        refreshToken.setToken(newRefreshToken);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        refreshTokenRepository.save(refreshToken);
        
        return AuthResponse.builder()
            .token(newAccessToken)
            .refreshToken(newRefreshToken)
            .user(userMapper.toDto(user))
            .expiresIn(jwtExpiration / 1000)
            .build();
    }
    
    public void logout(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        refreshTokenRepository.deleteByUser(user);
        log.info("User logged out: {}", user.getEmail());
    }
    
    private void saveRefreshToken(User user, String token) {
        // Delete existing refresh token
        refreshTokenRepository.findByUser(user)
            .ifPresent(refreshTokenRepository::delete);
        
        // Create new refresh token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        refreshTokenRepository.save(refreshToken);
    }
    
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}
