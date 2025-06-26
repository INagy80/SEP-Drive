package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatDAO extends JpaRepository<Chat, String> {

    @Query(name = "Chat.findChatsByReceiverId")
    List<Chat> findChatsBySenderId(@Param("senderId") Integer senderId);

    @Query(name = "Chat.findChatsByReceiverIdAndReceiver")
    Optional<Chat> findChatByReceiverAndSender(@Param("senderId") Integer id, @Param("recipientId") Integer recipientId);
}