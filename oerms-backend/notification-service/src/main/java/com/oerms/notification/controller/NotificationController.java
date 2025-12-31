package com.oerms.notification.controller;

import com.oerms.common.dto.ApiResponse;
import com.oerms.common.dto.PageResponse;
import com.oerms.common.util.JwtUtils;
import com.oerms.notification.dto.NotificationDTO;
import com.oerms.notification.dto.SendNotificationRequest;
import com.oerms.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Send a notification")
    public ResponseEntity<ApiResponse<NotificationDTO>> sendNotification(
            @RequestBody SendNotificationRequest request) {
        NotificationDTO notification = notificationService.sendNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Notification sent successfully", notification));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getMyNotifications(
            Pageable pageable,
            Authentication authentication) {
        UUID userId = JwtUtils.getUserId(authentication);
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, pageable);
        
        PageResponse<NotificationDTO> response = PageResponse.from(notifications);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getUnreadNotifications(
            Authentication authentication) {
        UUID userId = JwtUtils.getUserId(authentication);
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/my/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        UUID userId = JwtUtils.getUserId(authentication);
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<ApiResponse<NotificationDTO>> getNotification(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = JwtUtils.getUserId(authentication);
        NotificationDTO notification = notificationService.getNotification(id, userId);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/my/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        UUID userId = JwtUtils.getUserId(authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success( "All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success( "Notification deleted successfully", null));
    }
}