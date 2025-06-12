package com.example.SEPDrive.controller;

import java.time.LocalDateTime;

// Notification zum Kunden:
public record NotificationMessage(
        Integer notificationId,
        String title,
        String message,
        LocalDateTime createdAt
) {}
