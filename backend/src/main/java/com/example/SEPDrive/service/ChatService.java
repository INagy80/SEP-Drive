package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.ChatMessageDTO;
import com.example.SEPDrive.controller.notificationDTO;
import com.example.SEPDrive.controller.notificationpersonDTO;
import com.example.SEPDrive.exceptions.resourceNotFoundException;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.ChatMessageDAO;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatMessageDAO chatMessageDAO;

    @Autowired
    private userDAO userDAO;

    @Autowired
    private rideRequestDAO rideRequestDAO;

    @Autowired
    private SimpMessagingTemplate messaging;

    @Autowired
    private HttpInterpreter httpInterpreter;

    @Autowired
    private notificationService notificationService;

    @Transactional
    public ChatMessageDTO sendMessage(String receiverUsername, String content, Integer rideRequestId) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        user receiver = userDAO.findByUserName(receiverUsername);
        if (receiver == null) {
            throw new resourceNotFoundException("Receiver not found");
        }

        rideRequest rideRequest = null;
        if (rideRequestId != null) {
            rideRequest = rideRequestDAO.findbyid(rideRequestId);
            if (rideRequest == null) {
                throw new resourceNotFoundException("Ride request not found");
            }
        }

        ChatMessage message = new ChatMessage(currentUser, receiver, content, rideRequest);
        ChatMessage savedMessage = chatMessageDAO.save(message);

        // Send real-time notification to receiver
        ChatMessageDTO messageDTO = convertToDTO(savedMessage);
        messaging.convertAndSendToUser(
                receiverUsername,
                "/chat/message",
                messageDTO
        );

        return messageDTO;
    }

    public List<ChatMessageDTO> getConversation(String otherUsername) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        user otherUser = userDAO.findByUserName(otherUsername);
        if (otherUser == null) {
            throw new resourceNotFoundException("User not found");
        }

        List<ChatMessage> messages = chatMessageDAO.findConversationBetweenUsers(currentUser, otherUser);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getRideRequestMessages(Integer rideRequestId) {
        rideRequest rideRequest = rideRequestDAO.findbyid(rideRequestId);
        if (rideRequest == null) {
            throw new resourceNotFoundException("Ride request not found");
        }

        List<ChatMessage> messages = chatMessageDAO.findByRideRequestOrderByCreatedAtAsc(rideRequest);
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO editMessage(Long messageId, String newContent) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        ChatMessage message = chatMessageDAO.findById(messageId)
                .orElseThrow(() -> new resourceNotFoundException("Message not found"));

        // Check if user is the sender
        if (!message.getSender().equals(currentUser)) {
            throw new RuntimeException("You can only edit your own messages");
        }

        // Check if message is still editable (not read)
        if (message.getStatus() == MessageStatus.READ) {
            throw new RuntimeException("Cannot edit message that has been read");
        }

        message.setContent(newContent);
        ChatMessage updatedMessage = chatMessageDAO.save(message);

        // Send real-time update to receiver
        ChatMessageDTO messageDTO = convertToDTO(updatedMessage);
        messaging.convertAndSendToUser(
                message.getReceiver().getUserName(),
                "/chat/message/updated",
                messageDTO
        );

        return messageDTO;
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        ChatMessage message = chatMessageDAO.findById(messageId)
                .orElseThrow(() -> new resourceNotFoundException("Message not found"));

        // Check if user is the sender
        if (!message.getSender().equals(currentUser)) {
            throw new RuntimeException("You can only delete your own messages");
        }

        // Check if message is still deletable (not read)
        if (message.getStatus() == MessageStatus.READ) {
            throw new RuntimeException("Cannot delete message that has been read");
        }

        // Send real-time notification to receiver
        messaging.convertAndSendToUser(
                message.getReceiver().getUserName(),
                "/chat/message/deleted",
                messageId
        );


        chatMessageDAO.delete(message);
    }

    @Transactional
    public void markMessageAsRead(Long messageId) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        ChatMessage message = chatMessageDAO.findById(messageId)
                .orElseThrow(() -> new resourceNotFoundException("Message not found"));

        // Check if user is the receiver
        if (!message.getReceiver().equals(currentUser)) {
            throw new RuntimeException("You can only mark messages sent to you as read");
        }

        if (message.getStatus() != MessageStatus.READ) {
            message.setStatus(MessageStatus.READ);
            chatMessageDAO.save(message);

            // Send real-time notification to sender
            messaging.convertAndSendToUser(
                    message.getSender().getUserName(),
                    "/chat/message/read",
                    messageId
            );
        }
    }

    @Transactional
    public void markAllMessagesAsDelivered(String senderUsername) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        user sender = userDAO.findByUserName(senderUsername);
        if (sender == null) {
            throw new resourceNotFoundException("Sender not found");
        }

        List<ChatMessage> unreadMessages = chatMessageDAO.findUnreadMessagesByReceiver(currentUser.getId());
        unreadMessages.stream()
                .filter(message -> message.getSender().equals(sender))
                .forEach(message -> {
                    if (message.getStatus() == MessageStatus.SENT) {
                        message.setStatus(MessageStatus.DELIVERED);
                        chatMessageDAO.save(message);
                    }
                });
    }

    private ChatMessageDTO convertToDTO(ChatMessage message) {
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        boolean isEditable = message.getSender().equals(currentUser) && 
                           message.getStatus() != MessageStatus.READ;

        return new ChatMessageDTO(
                message.getId(),
                message.getSender().getUserName(),
                message.getReceiver().getUserName(),
                message.getContent(),
                message.getStatus(),
                message.getRideRequest() != null ? message.getRideRequest().getId().longValue() : null,
                message.getCreatedAt(),
                message.getUpdatedAt(),
                isEditable
        );
    }

    @Transactional
    public void markAllMessagesAsRead() {
        user currentUser = httpInterpreter.Interpreter();
        rideRequest aktiveride = null;
        user sender = null;
        if(currentUser instanceof Fahrer) {
           aktiveride = rideRequestDAO.findByDriver_Id(
                  currentUser.getId()).stream()
                  .filter(r -> ( r.getStatus().equals(RequestStatus.Active) || r.getStatus().equals(RequestStatus.Assigned) ) )
                  .findFirst().orElse(null);
           if(aktiveride != null) {
            sender = aktiveride.getCustomer();

           }
        }else {
             aktiveride = rideRequestDAO.findByCustomerId(
                            currentUser.getId()).stream()
                    .filter(r -> ( r.getStatus().equals(RequestStatus.Active) || r.getStatus().equals(RequestStatus.Assigned) ) )
                    .findFirst().orElse(null);
             if(aktiveride != null) {
               sender = aktiveride.getDriver();

             }
        }





        List<ChatMessage> unreadMessages = chatMessageDAO.findUnreadMessagesByReceiver(currentUser.getId());

        for (ChatMessage message : unreadMessages) {
            message.setStatus(MessageStatus.READ);
            chatMessageDAO.save(message);
        }

        notification note = new notification(
                null,
                null,
                "Chat!!",
                "Chat!!",
                null
        );

        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                null,
                null,
                note.getStatus(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getMessage(),
                note.getTitle(),
                null,
                0,
                0,
                0.0,
                null

        );

        notificationService.sendNotification(sender.getUserName(), notificationDTO);

    }
}