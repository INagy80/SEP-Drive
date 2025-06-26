package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.Message;
import com.example.SEPDrive.service.file.FileUtils;
import org.springframework.stereotype.Service;

@Service
public class MessageMapper {
    public MessageResponseDTO toMessageResponse(Message message) {
        return MessageResponseDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSenderId())
                .receiverId(message.getReceiverId())
                .type(message.getType())
                .state(message.getState())
                .createdAt(message.getCreatedAt())
                .media(FileUtils.readFileFromLocation(message.getMediaFilePath()))
                .build();
    }
}
