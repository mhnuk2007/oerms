package com.oerms.notification.repository;

import com.oerms.notification.entity.NotificationTemplate;
import com.oerms.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    Optional<NotificationTemplate> findByCodeAndIsActiveTrue(String code);

    Optional<NotificationTemplate> findByTypeAndIsActiveTrue(NotificationType type);
}