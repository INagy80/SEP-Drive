package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ChatMessageDTO sendMessage(@RequestBody Map<String, Object> request) {
        String receiverUsername = (String) request.get("receiverUsername");
        String content = (String) request.get("content");
        Integer rideRequestId = request.get("rideRequestId") != null ? 
            Integer.valueOf(request.get("rideRequestId").toString()) : null;
        
        return chatService.sendMessage(receiverUsername, content, rideRequestId);
    }

    @GetMapping("/conversation/{username}")
    public List<ChatMessageDTO> getConversation(@PathVariable String username) {
        return chatService.getConversation(username);
    }

    @GetMapping("/ride/{rideRequestId}")
    public List<ChatMessageDTO> getRideRequestMessages(@PathVariable Integer rideRequestId) {
        return chatService.getRideRequestMessages(rideRequestId);
    }

    @PutMapping("/edit")
    public ChatMessageDTO editMessage(@RequestBody Map<String, Object> request) {
        Long messageId = Long.valueOf(request.get("messageId").toString());
        String newContent = (String) request.get("newContent");
        
        return chatService.editMessage(messageId, newContent);
    }

    @DeleteMapping("/delete/{messageId}")
    public void deleteMessage(@PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
    }

    @PutMapping("/read/{messageId}")
    public void markMessageAsRead(@PathVariable Long messageId) {
        chatService.markMessageAsRead(messageId);
    }

    @PutMapping("/delivered/{senderUsername}")
    public void markMessagesAsDelivered(@PathVariable String senderUsername) {
        chatService.markAllMessagesAsDelivered(senderUsername);
    }

    // WebSocket message handlers
    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessageDTO handleChatMessage(@Payload Map<String, Object> message) {
        String receiverUsername = (String) message.get("receiverUsername");
        String content = (String) message.get("content");
        Integer rideRequestId = message.get("rideRequestId") != null ? 
            Integer.valueOf(message.get("rideRequestId").toString()) : null;
        
        return chatService.sendMessage(receiverUsername, content, rideRequestId);
    }

    @MessageMapping("/chat.edit")
    @SendTo("/topic/chat.edit")
    public ChatMessageDTO handleEditMessage(@Payload Map<String, Object> message) {
        Long messageId = Long.valueOf(message.get("messageId").toString());
        String newContent = (String) message.get("newContent");
        
        return chatService.editMessage(messageId, newContent);
    }

    @MessageMapping("/chat.delete")
    @SendTo("/topic/chat.delete")
    public Long handleDeleteMessage(@Payload Long messageId) {
        chatService.deleteMessage(messageId);
        return messageId;
    }

    @MessageMapping("/chat.read")
    @SendTo("/topic/chat.read")
    public Long handleReadMessage(@Payload Long messageId) {
        chatService.markMessageAsRead(messageId);
        return messageId;
    }
} 