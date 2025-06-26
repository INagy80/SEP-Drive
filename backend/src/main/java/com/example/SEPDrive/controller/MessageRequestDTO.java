package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequestDTO {

    private String content;
    private Integer senderId;
    private Integer receiverId;
    private MessageType type;
    private String chatId;
}
