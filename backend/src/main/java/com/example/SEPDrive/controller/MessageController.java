package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/save")
    @ResponseStatus(HttpStatus.CREATED)
    public void saveMessage(@RequestBody MessageRequestDTO message) {
        messageService.saveMessage(message);
    }

    @PostMapping(value = "/upload-media", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadMedia(
            @RequestParam("chat-id") String chatId,
            @RequestPart("file") MultipartFile file
    ) {
        messageService.uploadMediaMessage(chatId, file);
    }

    @PatchMapping("set-to-seen/{chatId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void setMessageToSeen(@PathVariable String chatId) {
        messageService.setMessagesToSeen(chatId);
    }

    @GetMapping("/chat/{chat-id}")
    public ResponseEntity<List<MessageResponseDTO>> getAllMessages(
            @PathVariable("chat-id") String chatId
    ) {

        return ResponseEntity.ok(messageService.findChatMessages(chatId));
    }
}
