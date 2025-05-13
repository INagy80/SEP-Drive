package com.example.SEPDrive.exceptions;

import java.time.LocalDateTime;

public record apiError(
        String path,
        String message,
        int statusCode,
        LocalDateTime localDateTime
) {
}