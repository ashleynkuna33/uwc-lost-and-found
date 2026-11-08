package com.uwcandfound.app.services.notification;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.uwcandfound.app.models.Notification;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.NotificationRepository;
import com.uwcandfound.app.request.notification.MarkAllReadResponse;
import com.uwcandfound.app.request.notification.NotificationResponse;
import com.uwcandfound.app.request.notification.UnreadCountResponse;

import lombok.RequiredArgsConstructor;

// Business rules for notifications. The controller only turns HTTP into calls
// to this class; other services (for example ReportService) call notifyUser()
// when something happens that the student should hear about.
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int MAX_PAGE_SIZE = 50;
    private static final int MAX_MESSAGE_LENGTH = 255; // notifications.message is VARCHAR(255)

    private final NotificationRepository notificationRepository;

    // ---------- reading (the logged-in user's own notifications) ----------

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMine(String email, boolean unreadOnly, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE));
        Page<Notification> result = unreadOnly
                ? notificationRepository.findByUser_EmailAndReadFalseOrderByCreatedAtDesc(email, pageable)
                : notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email, pageable);
        return result.map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(String email) {
        return new UnreadCountResponse(notificationRepository.countByUser_EmailAndReadFalse(email));
    }

    // ---------- changing state ----------

    @Transactional
    public NotificationResponse markRead(Long id, String email) {
        // Not found and "belongs to someone else" give the same 404 on purpose,
        // so ids can't be probed.
        Notification n = notificationRepository.findByIdAndUser_Email(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.setRead(true);
        return NotificationResponse.from(n);
    }

    @Transactional
    public MarkAllReadResponse markAllRead(String email) {
        return new MarkAllReadResponse(notificationRepository.markAllRead(email));
    }

    // ---------- creating (called by other services) ----------

    @Transactional
    public void notifyUser(User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(truncate(message));
        notificationRepository.save(n);
    }

    private String truncate(String message) {
        if (message == null) {
            return "";
        }
        return message.length() <= MAX_MESSAGE_LENGTH
                ? message
                : message.substring(0, MAX_MESSAGE_LENGTH - 3) + "...";
    }
}