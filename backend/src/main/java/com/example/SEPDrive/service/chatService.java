package com.example.SEPDrive.service;


import com.example.SEPDrive.controller.ChatResponseDTO;
import com.example.SEPDrive.controller.kundeDTO;
import com.example.SEPDrive.model.Chat;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.ChatDAO;
import com.example.SEPDrive.repository.userDAO;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class chatService {

    @Autowired
    private ChatDAO chatRepository;
    @Autowired
    private userDAO userRepository;
    @Autowired
    private  ChatMapper mapper;
    @Autowired
    private HttpInterpreter interpreter;

    @Transactional(readOnly = true)
    public List<ChatResponseDTO> getChatsByReceiverId() {
        user Currentuser = interpreter.Interpreter();
        return chatRepository.findChatsBySenderId(Currentuser.getId())
                .stream()
                .map(c -> mapper.toChatResponse(c, Currentuser.getId()))
                .toList();
    }


    public String createChat(Integer senderId, Integer receiverId) {

        Optional<Chat> existingChat = chatRepository.findChatByReceiverAndSender(senderId, receiverId);
        if (existingChat.isPresent()) {
            return existingChat.get().getId();
        }

        user sender = userRepository.findById(senderId)
                .orElseThrow(() ->  new EntityNotFoundException("User with id " + senderId + " not found"));
        user receiver = userRepository.findById(receiverId)
                .orElseThrow(() ->  new EntityNotFoundException("User with id " + receiverId + " not found"));

        Chat chat = new Chat();
        chat.setSender(sender);
        chat.setRecipient(receiver);

        Chat savedChat = chatRepository.save(chat);
        return savedChat.getId();
    }

    public List<kundeDTO> getAllContacts() {
        user Currentuser = interpreter.Interpreter();

        List<Chat> chats = chatRepository.findAll().stream().filter(chat -> Currentuser.equals(chat.getSender()) || Currentuser.equals(chat.getRecipient())).collect(Collectors.toList());
        List<kundeDTO> contacts = new ArrayList<>();

        for (Chat chat : chats) {
            if (Currentuser.equals(chat.getSender())) {
                contacts.add(
                        new kundeDTO(
                                chat.getRecipient().getId(),
                                chat.getRecipient().getUserName(),
                                chat.getRecipient().getEmail(),
                                chat.getRecipient().getFirstName(),
                                chat.getRecipient().getLastName(),
                                chat.getRecipient().getDateOfBirth(),
                                null,
                                chat.getRecipient() instanceof Fahrer ? "Fahrer" : "Kunde",
                                null

                        )
                );

            }else{
                contacts.add(
                        new kundeDTO(
                                chat.getSender().getId(),
                                chat.getSender().getUserName(),
                                chat.getSender().getEmail(),
                                chat.getSender().getFirstName(),
                                chat.getSender().getLastName(),
                                chat.getSender().getDateOfBirth(),
                                null,
                                chat.getSender() instanceof Fahrer ? "Fahrer" : "Kunde",
                                null

                        )
                );

            }
        }
        return contacts;
    }

}
