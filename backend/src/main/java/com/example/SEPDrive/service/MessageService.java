package com.example.SEPDrive.service;


import com.example.SEPDrive.controller.*;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.ChatDAO;
import com.example.SEPDrive.repository.MessageDAO;
import com.example.SEPDrive.repository.userDAO;
import com.example.SEPDrive.service.file.FileService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageDAO messageRepository;
    private final ChatDAO chatRepository;
    private final MessageMapper mapper;
    private final notificationService notificationService;
    private final FileService fileService;
    private final HttpInterpreter Interpreter;
    private final userDAO userRepository;

    public void saveMessage(MessageRequestDTO messageRequest) {
        Chat chat = chatRepository.findById(messageRequest.getChatId())
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setChat(chat);
        message.setSenderId(messageRequest.getSenderId());
        message.setReceiverId(messageRequest.getReceiverId());
        message.setType(messageRequest.getType());
        message.setState(MessageState.SENT);

        messageRepository.save(message);

        user sender = userRepository.findUserById(messageRequest.getSenderId());
        user recipient = userRepository.findUserById(messageRequest.getReceiverId());

        notification note = new notification(
                sender,
                recipient,
                messageRequest.getContent(),
                "Message from: "+sender.getFirstName()+" "+sender.getLastName(),
                null
        );



        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                new notificationpersonDTO(sender.getId(), sender.getUserName(),sender.getEmail(),sender.getFirstName(),sender.getLastName(),sender.getRating(),sender.getTotalRides()),
                new notificationpersonDTO(recipient.getId(), recipient.getUserName(),recipient.getEmail(),recipient.getFirstName(),recipient.getLastName(),recipient.getRating(),recipient.getTotalRides()),
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
        notificationService.sendNotification(recipient.getUserName(), notificationDTO);

    }


    public List<MessageResponseDTO> findChatMessages(String chatId) {
        return messageRepository.findMessagesByChatId(chatId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();
    }



    @Transactional
    public void setMessagesToSeen(String chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        final Integer recipientId = Interpreter.Interpreter().getId();

        messageRepository.setMessagesToSeenByChatId(chatId, MessageState.SEEN);

        user sender = userRepository.findUserById(chat.getSender().getId());
        user recipient = userRepository.findUserById(chat.getRecipient().getId());

        notification note = new notification(
                sender,
                recipient,
                "Message Seen",
                chat.getId(),
                null
        );



        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                new notificationpersonDTO(sender.getId(), sender.getUserName(),sender.getEmail(),sender.getFirstName(),sender.getLastName(),sender.getRating(),sender.getTotalRides()),
                new notificationpersonDTO(recipient.getId(), recipient.getUserName(),recipient.getEmail(),recipient.getFirstName(),recipient.getLastName(),recipient.getRating(),recipient.getTotalRides()),
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
        notificationService.sendNotification(recipient.getUserName(), notificationDTO);



    }

    public void uploadMediaMessage(String chatId, MultipartFile file) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        final Integer senderId = getSenderId(chat);
        final Integer receiverId = getRecipientId(chat);

        final String filePath = fileService.saveFile(file, senderId);
        Message message = new Message();
        message.setReceiverId(receiverId);
        message.setSenderId(senderId);
        message.setState(MessageState.SENT);
        message.setType(MessageType.IMAGE);
        message.setMediaFilePath(filePath);
        message.setChat(chat);
        messageRepository.save(message);



        user sender = userRepository.findUserById(chat.getSender().getId());
        user recipient = userRepository.findUserById(chat.getRecipient().getId());

        notification note = new notification(
                sender,
                recipient,
                "Media Uploaded",
                chat.getId(),
                null
        );



        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                new notificationpersonDTO(sender.getId(), sender.getUserName(),sender.getEmail(),sender.getFirstName(),sender.getLastName(),sender.getRating(),sender.getTotalRides()),
                new notificationpersonDTO(recipient.getId(), recipient.getUserName(),recipient.getEmail(),recipient.getFirstName(),recipient.getLastName(),recipient.getRating(),recipient.getTotalRides()),
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
        notificationService.sendNotification(recipient.getUserName(), notificationDTO);

    }

    private Integer getSenderId(Chat chat) {
        if (chat.getSender().getId().equals(Interpreter.Interpreter().getId())) {
            return chat.getSender().getId();
        }
        return chat.getRecipient().getId();
    }

    private Integer getRecipientId(Chat chat) {
        if (chat.getSender().getId().equals(Interpreter.Interpreter().getId())) {
            return chat.getRecipient().getId();
        }
        return chat.getSender().getId();
    }
}
