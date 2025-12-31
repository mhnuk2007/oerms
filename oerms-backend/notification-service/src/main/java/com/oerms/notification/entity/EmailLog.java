package com.oerms.notification.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.notification.enums.EmailStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_logs", indexes = {
        @Index(name = "idx_email_logs_to_email", columnList = "to_email"),
        @Index(name = "idx_email_logs_status", columnList = "status"),
        @Index(name = "idx_email_logs_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
public class EmailLog extends BaseEntity {

    @Column(nullable = false, name = "to_email")
    private String toEmail;

    @Column(name = "cc_emails", length = 500)
    private String ccEmails;

    @Column(name = "bcc_emails", length = 500)
    private String bccEmails;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EmailStatus status = EmailStatus.PENDING;

    @Column(columnDefinition = "TEXT", name = "error_message")
    private String errorMessage;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "related_notification_id")
    private UUID relatedNotificationId;
}