package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.AuthenticatinResponse;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.userDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class loginService {

    @Autowired
    private  userDAO userDao;

    @Autowired
    private emailSenderService emailSenderService;


    public AuthenticatinResponse verify(String s, String password) {
        return null;
    }
}
