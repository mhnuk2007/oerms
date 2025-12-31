package com.oerms.notification.service;

import com.oerms.notification.dto.EmailRequest;
import com.oerms.notification.dto.SendNotificationRequest;
import com.oerms.notification.entity.EmailLog;
import com.oerms.notification.enums.EmailStatus;
import com.oerms.notification.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;

    @Value("${app.notification.email.from}")
    private String fromEmail;

    @Value("${app.notification.email.from-name}")
    private String fromName;

    @Async
    public void sendNotificationEmail(SendNotificationRequest request) {
        EmailRequest emailRequest = EmailRequest.builder()
                .to(request.getEmail())
                .subject(request.getTitle())
                .body(request.getMessage())
                .isHtml(true)
                .build();

        sendEmail(emailRequest);
    }

    @Async
    public void sendEmail(EmailRequest request) {
        EmailLog emailLog = EmailLog.builder()
                .toEmail(request.getTo())
                .subject(request.getSubject())
                .body(request.getBody())
                .status(EmailStatus.PENDING)
                .build();

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());

            String content = request.getBody();
            if (request.getTemplateCode() != null && request.getTemplateData() != null) {
                content = processTemplate(request.getTemplateCode(), request.getTemplateData());
            }

            helper.setText(content, Boolean.TRUE.equals(request.getIsHtml()));

            if (request.getCc() != null && request.getCc().length > 0) {
                helper.setCc(request.getCc());
            }

            if (request.getBcc() != null && request.getBcc().length > 0) {
                helper.setBcc(request.getBcc());
            }

            mailSender.send(message);

            emailLog.setStatus(EmailStatus.SENT);
            emailLog.setSentAt(LocalDateTime.now());
            log.info("Email sent successfully to: {}", request.getTo());

        } catch (Exception e) {
            log.error("Failed to send email to: {}", request.getTo(), e);
            emailLog.setStatus(EmailStatus.FAILED);
            emailLog.setErrorMessage(e.getMessage());
        } finally {
            emailLogRepository.save(emailLog);
        }
    }

    private String processTemplate(String templateCode, Map<String, Object> data) {
        Context context = new Context();
        context.setVariables(data);
        return templateEngine.process(templateCode, context);
    }

    public void retryFailedEmails() {
        log.info("Retrying failed emails...");
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        
        emailLogRepository.findByStatusAndRetryCountLessThanAndCreatedAtAfter(
                EmailStatus.FAILED, 3, cutoff
        ).forEach(emailLog -> {
            EmailRequest request = EmailRequest.builder()
                    .to(emailLog.getToEmail())
                    .subject(emailLog.getSubject())
                    .body(emailLog.getBody())
                    .isHtml(true)
                    .build();
            
            emailLog.setRetryCount(emailLog.getRetryCount() + 1);
            emailLogRepository.save(emailLog);
            
            sendEmail(request);
        });
    }
}