package com.example.SEPDrive.service;

import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class TwoFAUpdateService {
    @Autowired
    private userDAO userDAO;

    @Transactional                        // Ensures the updates happen inside a transaction
    @Scheduled(fixedRate = 600000)       // Run every 10 minutes (600,000ms = 10 mins)
    public void updateUserAttributes() {

        List<user> users = userDAO.findAll();

        for (user u : users) {
            Integer FA2 = new Random().nextInt(900000) + 100000;
            u.setTwoFA(FA2);
            userDAO.save(u);
        }
    }



}
