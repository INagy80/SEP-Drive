package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.notification;
import com.example.SEPDrive.model.notificationStatus;
import com.example.SEPDrive.repository.notificationDAO;
import com.example.SEPDrive.service.notificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/v1/notifications")
public class notificationController {

    @Autowired
    private notificationDAO notificationDAO;

    /** Get all notifications for the current user */
    @GetMapping
    public List<notification> list(Authentication auth) {
        String username = auth.getName();
        return notificationDAO.findAll()
                .stream()
                .filter(n -> n.getReceiver().getUserName().equals(username))
                .toList();
    }

    /** Mark a notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Integer id,
                                         Authentication auth) {
        var opt = notificationDAO.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var note = opt.get();
        if (!note.getReceiver().getUserName().equals(auth.getName())) {
            return ResponseEntity.status(403).build();
        }
        note.setStatus(notificationStatus.READ);
        notificationDAO.save(note);
        return ResponseEntity.ok().build();
    }


}
