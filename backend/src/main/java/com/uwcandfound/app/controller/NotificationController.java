package com.uwcandfound.app.controller;



import org.springframework.data.web.PagedModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uwcandfound.app.request.notification.MarkAllReadResponse;
import com.uwcandfound.app.request.notification.NotificationResponse;
import com.uwcandfound.app.request.notification.UnreadCountResponse;
import com.uwcandfound.app.security.CurrentPrincipalService;
import com.uwcandfound.app.services.notification.NotificationService;

import lombok.RequiredArgsConstructor;

// Notification endpoints for the logged-in user (students and admins alike).
// Thin on purpose: HTTP in, service call, result out. The user's email comes
// from the validated JWT via CurrentPrincipalService, never from the URL.
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentPrincipalService currentPrincipalService;

    // GET /api/notifications?unread=false&page=0&size=10  -> newest first
    // Returned as a PagedModel so the JSON shape is stable (no PageImpl warning).
    @GetMapping
    public PagedModel<NotificationResponse> list(
            @RequestParam(defaultValue = "false") boolean unread,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return new PagedModel<>(notificationService.getMine(
                currentPrincipalService.getCurrentUserEmail(), unread, page, size));
    }

    // GET /api/notifications/unread-count  -> { "unread": 3 }  (bell badge)
    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount() {
        return notificationService.unreadCount(currentPrincipalService.getCurrentUserEmail());
    }

    // PATCH /api/notifications/{id}/read  -> the updated notification
    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable Long id) {
        return notificationService.markRead(id, currentPrincipalService.getCurrentUserEmail());
    }

    // PATCH /api/notifications/read-all  -> { "updated": 3 }
    @PatchMapping("/read-all")
    public MarkAllReadResponse markAllRead() {
        return notificationService.markAllRead(currentPrincipalService.getCurrentUserEmail());
    }
}