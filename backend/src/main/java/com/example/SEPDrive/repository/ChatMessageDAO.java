package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.ChatMessage;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.model.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageDAO extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.rideRequest = :rideRequest ORDER BY cm.createdAt ASC")
    List<ChatMessage> findByRideRequestOrderByCreatedAtAsc(@Param("rideRequest") rideRequest rideRequest);

    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender = :user1 AND cm.receiver = :user2) OR (cm.sender = :user2 AND cm.receiver = :user1) ORDER BY cm.createdAt ASC")
    List<ChatMessage> findConversationBetweenUsers(@Param("user1") user user1, @Param("user2") user user2);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.receiver = :receiver AND cm.status = 'SENT'")
    List<ChatMessage> findUnreadMessagesByReceiver(@Param("receiver") user receiver);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.sender = :sender AND cm.status != 'READ'")
    List<ChatMessage> findEditableMessagesBySender(@Param("sender") user sender);
} 