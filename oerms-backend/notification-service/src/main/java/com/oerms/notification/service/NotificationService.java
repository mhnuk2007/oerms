package com.oerms.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oerms.common.exception.ResourceNotFoundException;
import com.oerms.notification.dto.NotificationDTO;
import com.oerms.notification.dto.SendNotificationRequest;
import com.oerms.notification.entity.Notification;
import com.oerms.notification.enums.NotificationStatus;
import com.oerms.notification.mapper.NotificationMapper;
import com.oerms.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final EmailService emailService;
    private final SmsService smsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.notification.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.notification.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.notification.in-app.enabled:true}")
    private boolean inAppEnabled;

    @Value("${app.notification.websocket.enabled:true}")
    private boolean websocketEnabled;

    @Value("${app.notification.in-app.retention-days:30}")
    private int retentionDays;

    @Transactional
    public NotificationDTO sendNotification(SendNotificationRequest request) {
        log.info("Sending notification to user: {} of type: {}", request.getUserId(), request.getType());

        Notification notification = null;

        if (inAppEnabled && Boolean.TRUE.equals(request.getSendInApp())) {
            notification = createInAppNotification(request);
        }

        if (emailEnabled && Boolean.TRUE.equals(request.getSendEmail()) && request.getEmail() != null) {
            try {
                emailService.sendNotificationEmail(request);
            } catch (Exception e) {
                log.error("Failed to send email notification", e);
            }
        }

        if (smsEnabled && Boolean.TRUE.equals(request.getSendSms())) {
            try {
                smsService.sendSms(request);
            } catch (Exception e) {
                log.error("Failed to send SMS notification", e);
            }
        }

        if (websocketEnabled && notification != null) {
            sendWebSocketNotification(notification);
        }

        return notification != null ? notificationMapper.toDTO(notification) : null;
    }

    private Notification createInAppNotification(SendNotificationRequest request) {
        String metadataJson = null;
        if (request.getMetadata() != null) {
            try {
                metadataJson = objectMapper.writeValueAsString(request.getMetadata());
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize metadata", e);
            }
        }

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .metadata(metadataJson)
                .status(NotificationStatus.SENT)
                .isRead(false)
                .relatedEntityId(request.getRelatedEntityId())
                .relatedEntityType(request.getRelatedEntityType())
                .actionUrl(request.getActionUrl())
                .priority(request.getPriority() != null ? request.getPriority() : 5)
                .build();

        notification = notificationRepository.save(notification);
        log.info("In-app notification created: {}", notification.getId());
        return notification;
    }

    private void sendWebSocketNotification(Notification notification) {
        try {
            NotificationDTO dto = notificationMapper.toDTO(notification);
            messagingTemplate.convertAndSendToUser(
                    notification.getUserId().toString(),
                    "/queue/notifications",
                    dto
            );
            log.info("WebSocket notification sent to user: {}", notification.getUserId());
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(UUID userId, Pageable pageable) {
        log.debug("Fetching notifications for user: {}", userId);
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(notificationMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(UUID userId) {
        log.debug("Fetching unread notifications for user: {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationRepository.markAllAsReadForUser(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteNotification(UUID notificationId) {
        log.info("Deleting notification: {}", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteOldNotifications() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        log.info("Deleting notifications older than: {}", cutoffDate);
        List<Notification> oldNotifications = notificationRepository.findOldNotifications(cutoffDate);
        notificationRepository.deleteAll(oldNotifications);
        log.info("Deleted {} old notifications", oldNotifications.size());
    }

    @Transactional(readOnly = true)
    public NotificationDTO getNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!notification.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }

        return notificationMapper.toDTO(notification);
    }
}