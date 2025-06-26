package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.Message;
import com.example.SEPDrive.model.MessageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageDAO  extends JpaRepository<Message, Long> {

    @Query(name = "Message.findMessagesByChatId")
    List<Message> findMessagesByChatId(@Param("chatId") String chatId);

    @Query(name ="Message.setMessagesToSeenByChat")
    @Modifying
    void setMessagesToSeenByChatId(@Param("chatId") String chatId, @Param("newState") MessageState state);
}
