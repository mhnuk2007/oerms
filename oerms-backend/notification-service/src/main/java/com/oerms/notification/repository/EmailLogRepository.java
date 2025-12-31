package com.oerms.notification.repository;

import com.oerms.notification.entity.EmailLog;
import com.oerms.notification.enums.EmailStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, UUID> {

    Page<EmailLog> findByToEmailOrderByCreatedAtDesc(String toEmail, Pageable pageable);

    List<EmailLog> findByStatusAndRetryCountLessThanAndCreatedAtAfter(
            EmailStatus status, Integer retryCount, LocalDateTime createdAt);

    Long countByStatusAndCreatedAtAfter(EmailStatus status, LocalDateTime createdAt);
}