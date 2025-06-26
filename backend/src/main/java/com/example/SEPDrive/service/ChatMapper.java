package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.ChatResponseDTO;
import com.example.SEPDrive.model.Chat;
import org.springframework.stereotype.Service;

@Service
public class ChatMapper {
    public ChatResponseDTO toChatResponse(Chat chat, Integer senderId) {
        return ChatResponseDTO.builder()
                .id(chat.getId())
                .name(chat.getChatName(senderId))
                .unreadCount(chat.getUnreadMessages(senderId))
                .lastMessage(chat.getLastMessage())
                .lastMessageTime(chat.getLastMessageTime())
                .isRecipientOnline(chat.getRecipient().isUserOnline())
                .senderId(chat.getSender().getId())
                .receiverId(chat.getRecipient().getId())
                .build();
    }
}
