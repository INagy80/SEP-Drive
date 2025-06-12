//package com.example.SEPDrive.service;
//
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.event.EventListener;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.messaging.SessionDisconnectEvent;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class WebSocketEventListener {
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    @EventListener
//    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
//
//        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
//        String username = accessor.getSessionAttributes().get("username").toString();
//        if(username != null) {
////            log.info("User {} disconnected", username);
////            messagingTemplate.convertAndSend("/topic/public" , username);
//        }
//    }
//
//
//}
