package com.oerms.notification.entity;

import com.oerms.common.entity.BaseEntity;
import com.oerms.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_templates", indexes = {
        @Index(name = "idx_templates_code", columnList = "code"),
        @Index(name = "idx_templates_type", columnList = "type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
public class NotificationTemplate extends BaseEntity {

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(nullable = false, length = 500)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false, name = "email_template")
    private String emailTemplate;

    @Column(columnDefinition = "TEXT", name = "sms_template")
    private String smsTemplate;

    @Column(columnDefinition = "TEXT", name = "in_app_template")
    private String inAppTemplate;

    @Column(nullable = false, name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}