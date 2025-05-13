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
    public boolean register(user user) {
        if (userDao.existsUserByEmail(user.getEmail().toLowerCase())) {
            throw new duplicatResourceException("This email already exists");
        } else if (userDao.existsUserByUserName(user.getUserName())) {
            throw new duplicatResourceException("This username already exists");

            //add
        }else{

            user.setPassword(encoder.encode(user.getPassword()));
            user.setIsemailVerified(false);
            user.setTwoFA(new Random().nextInt(900000) + 100000);
            user.setEmail(user.getEmail().toLowerCase());
            userDao.save(user);
            emailSenderService.sendEmail(user.getEmail(), "SEPDrive Verification Code",
                    "Hello "+ user.getFirstName()+" "+user.getLastName()+", \n \n" +"Your verification code is:  " + user.getTwoFA() + ". \n \n \n Best regards,\n SEPDrive ");
            return true;


        }
    }

}
