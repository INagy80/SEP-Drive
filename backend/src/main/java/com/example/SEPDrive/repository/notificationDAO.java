package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface notificationDAO extends JpaRepository<notification, Integer> {
}
