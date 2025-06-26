package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.HttpInterpreter;
import com.example.SEPDrive.service.chatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/v1/chats")
public class ChatController {

    @Autowired
    private chatService chatService;
    @Autowired
    private HttpInterpreter Interpreter;


    @PostMapping("CreateChat/{receiverId}")
    public ResponseEntity<StringResponse> createChat(
            @PathVariable Integer receiverId
    ) {

        final String chatId = chatService.createChat(Interpreter.Interpreter().getId(), receiverId);
        StringResponse response = StringResponse.builder()
                .response(chatId)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("findall")
    public ResponseEntity<List<ChatResponseDTO>> getChatsByReceiver() {
        return ResponseEntity.ok(chatService.getChatsByReceiverId());
    }

    @GetMapping("/findAllContacts")
    public ResponseEntity<List<kundeDTO>> getAllcontacts() {
        return ResponseEntity.ok(chatService.getAllContacts());
    }
}
