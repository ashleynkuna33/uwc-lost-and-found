package com.uwcandfound.app.request.notification;


import java.time.LocalDateTime;

import com.uwcandfound.app.models.Notification;

// What the front end receives for one notification. The entity is never sent
// directly, so the user and password hash can't leak.
public record NotificationResponse(
        Long id,
        String message,
        boolean read,
        LocalDateTime createdAt) {

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}