package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.MessageState;
import com.example.SEPDrive.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponseDTO {
    private Long id;
    private String content;
    private MessageType type;
    private MessageState state;
    private Integer senderId;
    private Integer receiverId;
    private LocalDateTime createdAt;
    private byte[] media;
}
