package com.oerms.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base class for all domain events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID eventId;
    private LocalDateTime eventTime = LocalDateTime.now();
    private String eventType;
    private String source;

    public BaseEvent(String eventType, String source) {
        this.eventType = eventType;
        this.source = source;
        this.eventId = UUID.randomUUID();
        this.eventTime = LocalDateTime.now();
    }
}