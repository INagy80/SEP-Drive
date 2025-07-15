package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.MessageStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private String senderUsername;
    private String receiverUsername;
    private String content;
    private MessageStatus status;
    private Long rideRequestId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isEditable;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class SendMessageRequest {
    private String receiverUsername;
    private String content;
    private Long rideRequestId;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class EditMessageRequest {
    private Long messageId;
    private String newContent;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class MarkAsReadRequest {
    private Long messageId;
} 