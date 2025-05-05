package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.AuthenticatinResponse;
import com.example.SEPDrive.exceptions.duplicatResourceException;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class registerService {

    @Autowired
    private  userDAO userDao;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private emailSenderService emailSenderService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);




    //@EventListener(ApplicationReadyEvent.class)
    public AuthenticatinResponse register(user user) {
        if (userDao.existsUserByEmail(user.getEmail())) {
            throw new duplicatResourceException("This email already exists");
        } else if (userDao.existsUserByUserName(user.getUserName())) {
            throw new duplicatResourceException("This username already exists");

            //add
        }else{
            user.setPassword(encoder.encode(user.getPassword()));
            Integer FA2 = new Random().nextInt(900000) + 100000;
            emailSenderService.sendEmail(user.getEmail(), "SEPDrive Verification Code", "Your verification code is: " + FA2);
            userDao.save(user);
            var jwtToken = jwtService.generateToken(user.getUserName());
            return AuthenticatinResponse.builder().token(jwtToken).build();


        }
    }

}
