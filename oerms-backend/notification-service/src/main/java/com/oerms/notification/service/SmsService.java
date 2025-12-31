package com.oerms.notification.service;

import com.oerms.notification.dto.SendNotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    @Value("${app.notification.sms.provider:twilio}")
    private String smsProvider;

    @Value("${app.notification.sms.account-sid:}")
    private String accountSid;

    @Value("${app.notification.sms.auth-token:}")
    private String authToken;

    @Value("${app.notification.sms.from-number:}")
    private String fromNumber;

    @Async
    public void sendSms(SendNotificationRequest request) {
        // Placeholder for SMS implementation
        log.info("SMS notification would be sent: {}", request.getMessage());
        
        // Example Twilio integration (uncomment when ready):
        /*
        Twilio.init(accountSid, authToken);
        Message message = Message.creator(
            new PhoneNumber(request.getPhoneNumber()),
            new PhoneNumber(fromNumber),
            request.getMessage()
        ).create();
        log.info("SMS sent with SID: {}", message.getSid());
        */
    }
}