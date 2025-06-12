package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.NotificationMessage;
import com.example.SEPDrive.controller.notificationDTO;
import com.example.SEPDrive.model.notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.SEPDrive.repository.notificationDAO;

@Service
@Slf4j
public class notificationService {

    @Autowired
    private notificationDAO notificationDAO;

    @Autowired
    private SimpMessagingTemplate messaging;



    public void sendNotification(String userName, notificationDTO notification) {
        System.out.println("sending notification to  user with payload " + userName);
        messaging.convertAndSendToUser(
                userName,
                "/notification",
                notification
                );

    }


//    public void notifyUser(notification note) {
//        // 1) persist
//        var saved = notificationDAO.save(note);
//
//        // 2) push to websocket queue
//        NotificationMessage msg = new NotificationMessage(
//                saved.getId(),
//                saved.getTitle(),
//                saved.getMessage(),
//                saved.getCreatedAt()
//        );
//        messaging.convertAndSendToUser(
//                saved.getReceiver().getUserName(),
//                "/queue/notifications",
//                msg
//        );
//    }

}

